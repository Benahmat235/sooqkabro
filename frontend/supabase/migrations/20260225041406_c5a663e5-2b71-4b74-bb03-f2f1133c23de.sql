
-- Table to store OTP codes for phone verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) can manage OTP codes, no public access
-- No policies needed since we use service role key in edge function

-- Index for faster lookups
CREATE INDEX idx_otp_codes_phone ON public.otp_codes (phone, code);

-- Auto-cleanup old OTP codes (older than 10 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_expired_otps
AFTER INSERT ON public.otp_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_otps();
