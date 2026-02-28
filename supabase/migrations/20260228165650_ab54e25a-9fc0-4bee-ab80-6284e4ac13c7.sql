
-- Allow listing owners to count favorites on their listings
CREATE POLICY "Listing owners can count favorites" ON public.favorites
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = favorites.listing_id AND user_id = auth.uid())
);
