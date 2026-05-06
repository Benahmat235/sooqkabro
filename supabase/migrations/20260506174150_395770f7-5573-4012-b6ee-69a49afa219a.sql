
CREATE OR REPLACE FUNCTION public.get_my_listings_phones()
RETURNS TABLE(id uuid, phone text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, phone FROM public.listings WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_listings_phones() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_listings_phones() TO authenticated;
