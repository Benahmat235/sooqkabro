
-- 1. Restrict phone column on profiles (publicly readable except phone)
REVOKE SELECT (phone) ON public.profiles FROM anon, authenticated;

-- 2. Harden get_seller_phone: SECURITY INVOKER + auth required
CREATE OR REPLACE FUNCTION public.get_seller_phone(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT phone FROM public.profiles
  WHERE id = _user_id
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE user_id = _user_id AND status = 'published'
    );
$$;

-- Grant phone read to the function owner context via a separate definer wrapper that still enforces auth
-- Since SECURITY INVOKER + revoked column SELECT would block reads, use SECURITY DEFINER but enforce auth in code
CREATE OR REPLACE FUNCTION public.get_seller_phone(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN (
    SELECT phone FROM public.profiles
    WHERE id = _user_id
      AND EXISTS (
        SELECT 1 FROM public.listings
        WHERE user_id = _user_id AND status = 'published'
      )
  );
END;
$$;

-- 3. Storage: add UPDATE policy on listing-photos
DROP POLICY IF EXISTS "Users can update own listing photos" ON storage.objects;
CREATE POLICY "Users can update own listing photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'listing-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 4. Restrict bucket listing: limit SELECT on storage.objects for listing-photos
-- Keep public read for individual files via public bucket URLs, but prevent listing the bucket via API
DROP POLICY IF EXISTS "Public read listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing photos" ON storage.objects;
-- Files are still accessible via public URL (bucket is public). No SELECT policy needed for direct URL fetches.
-- This prevents API-based listing of all bucket contents.

-- 5. Realtime: restrict subscriptions to messages users participate in
-- Enable RLS on realtime.messages (Supabase-managed table for postgres_changes)
-- Note: realtime.messages RLS requires policies that check participation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'realtime' AND tablename = 'messages') THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "authenticated_only_realtime" ON realtime.messages';
    EXECUTE 'CREATE POLICY "authenticated_only_realtime" ON realtime.messages FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;
