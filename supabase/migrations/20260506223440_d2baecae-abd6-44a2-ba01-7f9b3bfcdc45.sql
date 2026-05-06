
-- Revoke broad EXECUTE and grant only to authenticated for SECURITY DEFINER RPCs
REVOKE EXECUTE ON FUNCTION public.get_my_profile_phone() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_listings_phones() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_seller_phone(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_listing_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_my_profile_phone() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_listings_phones() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_seller_phone(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
