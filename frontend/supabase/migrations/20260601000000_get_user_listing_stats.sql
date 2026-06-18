CREATE OR REPLACE FUNCTION public.get_user_listing_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_listing_count integer;
  v_view_count integer;
  v_fav_count integer;
BEGIN
  -- Get total listings count
  SELECT COUNT(id) INTO v_listing_count
  FROM public.listings
  WHERE user_id = p_user_id;

  -- Get total views across all user's listings
  SELECT COUNT(v.id) INTO v_view_count
  FROM public.listing_views v
  JOIN public.listings l ON l.id = v.listing_id
  WHERE l.user_id = p_user_id;

  -- Get total favorites across all user's listings
  SELECT COUNT(f.id) INTO v_fav_count
  FROM public.favorites f
  JOIN public.listings l ON l.id = f.listing_id
  WHERE l.user_id = p_user_id;

  RETURN json_build_object(
    'total_listings', COALESCE(v_listing_count, 0),
    'total_views', COALESCE(v_view_count, 0),
    'total_favorites', COALESCE(v_fav_count, 0)
  );
END;
$$;
