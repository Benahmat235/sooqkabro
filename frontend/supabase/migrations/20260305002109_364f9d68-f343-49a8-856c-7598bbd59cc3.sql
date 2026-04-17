
-- Fix storage upload policy to restrict uploads to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;

CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
