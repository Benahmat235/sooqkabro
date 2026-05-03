-- Add content_hash column for duplicate detection
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_listings_user_content_hash 
  ON public.listings(user_id, content_hash) 
  WHERE status = 'published';

-- Trigger function: prevent duplicate listings within 24h
CREATE OR REPLACE FUNCTION public.prevent_duplicate_listings()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Compute content hash (lowercase, trimmed)
  NEW.content_hash := encode(
    digest(
      lower(regexp_replace(coalesce(NEW.title,'') || '|' || coalesce(NEW.description,''), '\s+', '', 'g')),
      'sha256'
    ),
    'hex'
  );

  -- Block exact duplicates within last 24h from same user
  IF EXISTS (
    SELECT 1 FROM public.listings
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND status = 'published'
      AND created_at > now() - interval '24 hours'
      AND (
        (lower(trim(title)) = lower(trim(NEW.title)) AND phone = NEW.phone)
        OR content_hash = NEW.content_hash
      )
  ) THEN
    RAISE EXCEPTION 'duplicate_listing_24h: une annonce identique existe déjà dans les dernières 24 heures';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_listings_trigger ON public.listings;
CREATE TRIGGER prevent_duplicate_listings_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_listings();

-- listing_flags table
CREATE TABLE IF NOT EXISTS public.listing_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details JSONB,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

CREATE INDEX IF NOT EXISTS idx_listing_flags_listing ON public.listing_flags(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_flags_reviewed ON public.listing_flags(reviewed, flagged_at DESC);

ALTER TABLE public.listing_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all flags"
  ON public.listing_flags FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update flags"
  ON public.listing_flags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete flags"
  ON public.listing_flags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No client INSERT policy: only edge functions with service role insert flags