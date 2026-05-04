
-- 1) Remove overly-permissive realtime SELECT policy on messages
DROP POLICY IF EXISTS "authenticated_only_realtime" ON public.messages;

-- 2) Restrict listings.phone column from anon/authenticated; access only via get_seller_phone RPC
REVOKE SELECT (phone) ON public.listings FROM anon, authenticated, public;

-- 3) Add INSERT policy for listing_flags so authenticated users can submit reports
DROP POLICY IF EXISTS "Users can submit flags" ON public.listing_flags;
CREATE POLICY "Users can submit flags"
ON public.listing_flags
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND reviewed = false
  AND reviewed_by IS NULL
  AND reviewed_at IS NULL
);

-- 4) Lock down SECURITY DEFINER functions: revoke from anon, keep for authenticated
REVOKE EXECUTE ON FUNCTION public.get_seller_phone(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_seller_phone(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_listing_owner(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
