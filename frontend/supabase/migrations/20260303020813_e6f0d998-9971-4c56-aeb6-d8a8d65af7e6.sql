
-- Add unique constraint to prevent duplicate views per user per listing
-- First, delete duplicates keeping only the earliest view
DELETE FROM public.listing_views a
USING public.listing_views b
WHERE a.id > b.id
  AND a.listing_id = b.listing_id
  AND a.viewer_id = b.viewer_id
  AND a.viewer_id IS NOT NULL;

-- Create unique index for authenticated users (viewer_id not null)
CREATE UNIQUE INDEX idx_listing_views_unique_viewer 
ON public.listing_views (listing_id, viewer_id) 
WHERE viewer_id IS NOT NULL;
