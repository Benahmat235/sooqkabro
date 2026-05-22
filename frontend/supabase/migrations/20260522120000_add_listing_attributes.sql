-- Store category-specific listing details such as brand, model, mileage,
-- storage, surface, warranty, and price type.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS attributes jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_listings_attributes_gin
  ON public.listings USING gin (attributes);

GRANT SELECT (attributes) ON public.listings TO anon, authenticated;
