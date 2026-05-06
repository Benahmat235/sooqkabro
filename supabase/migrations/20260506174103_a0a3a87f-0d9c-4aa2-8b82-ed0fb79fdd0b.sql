
-- =========================================================================
-- Restrict client read access to phone columns on profiles and listings
-- =========================================================================

-- Revoke direct SELECT on phone column from public, anon and authenticated.
-- PostgREST/Supabase clients query as anon or authenticated; this prevents
-- phone from being returned in any SELECT (including SELECT *).
REVOKE SELECT (phone) ON public.profiles FROM PUBLIC, anon, authenticated;
REVOKE SELECT (phone) ON public.listings FROM PUBLIC, anon, authenticated;

-- Re-grant SELECT explicitly on all non-phone columns of profiles
GRANT SELECT (id, display_name, avatar_url, username, is_verified, last_seen, bio, created_at, updated_at)
  ON public.profiles TO anon, authenticated;

-- Re-grant SELECT explicitly on all non-phone columns of listings
GRANT SELECT (id, user_id, title, description, price, original_price,
              category_id, subcategory_id, city_id, quartier, status,
              created_at, updated_at, badge, content_hash)
  ON public.listings TO anon, authenticated;

-- =========================================================================
-- Secure functions for owners to retrieve their own phone numbers
-- =========================================================================

-- Returns the authenticated user's own profile phone number
CREATE OR REPLACE FUNCTION public.get_my_profile_phone()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone FROM public.profiles WHERE id = auth.uid();
$$;

-- Returns the phone stored on a listing, only if the caller owns that listing
CREATE OR REPLACE FUNCTION public.get_my_listing_phone(_listing_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone FROM public.listings
  WHERE id = _listing_id AND user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_profile_phone() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_listing_phone(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile_phone() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) TO authenticated;
