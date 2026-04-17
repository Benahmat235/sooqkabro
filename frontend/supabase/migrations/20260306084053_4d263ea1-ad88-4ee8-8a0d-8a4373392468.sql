-- Fix listing_views: replace the overly permissive INSERT policy with a scoped one
DROP POLICY IF EXISTS "Anyone can insert views" ON public.listing_views;
CREATE POLICY "Scoped insert views" ON public.listing_views
  FOR INSERT
  WITH CHECK (
    viewer_id IS NULL OR viewer_id = auth.uid()
  );

-- Add restrictive RLS policies to otp_codes (currently has RLS enabled but no policies)
-- Only the service role (edge functions) should insert/update; no client access needed.
CREATE POLICY "No client read access to OTP codes" ON public.otp_codes
  FOR SELECT
  USING (false);

CREATE POLICY "No client insert access to OTP codes" ON public.otp_codes
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No client update access to OTP codes" ON public.otp_codes
  FOR UPDATE
  USING (false);

CREATE POLICY "No client delete access to OTP codes" ON public.otp_codes
  FOR DELETE
  USING (false);