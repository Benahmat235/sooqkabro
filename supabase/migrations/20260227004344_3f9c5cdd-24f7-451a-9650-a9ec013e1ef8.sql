
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
