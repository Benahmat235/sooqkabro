CREATE TABLE IF NOT EXISTS public.listing_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  flagged_at timestamptz NOT NULL DEFAULT now(),
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz
);

ALTER TABLE public.listing_flags
  ADD COLUMN IF NOT EXISTS reporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.listing_flags ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_listing_flags_listing_id
  ON public.listing_flags(listing_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_flags_user_report_once
  ON public.listing_flags(listing_id, reporter_id, reason)
  WHERE reporter_id IS NOT NULL AND reason = 'user_report';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listing_flags'
      AND policyname = 'Users can report published listings'
  ) THEN
    CREATE POLICY "Users can report published listings"
    ON public.listing_flags
    FOR INSERT
    TO authenticated
    WITH CHECK (
      reporter_id = auth.uid()
      AND reason = 'user_report'
      AND EXISTS (
        SELECT 1
        FROM public.listings
        WHERE listings.id = listing_flags.listing_id
          AND listings.status = 'published'
          AND listings.user_id <> auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listing_flags'
      AND policyname = 'Admins can view listing flags'
  ) THEN
    CREATE POLICY "Admins can view listing flags"
    ON public.listing_flags
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listing_flags'
      AND policyname = 'Admins can update listing flags'
  ) THEN
    CREATE POLICY "Admins can update listing flags"
    ON public.listing_flags
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
