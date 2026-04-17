
-- Add last_seen and bio columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create seller_followers table
CREATE TABLE IF NOT EXISTS public.seller_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seller_id, follower_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seller_followers_seller_id ON public.seller_followers(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_followers_follower_id ON public.seller_followers(follower_id);

-- Enable RLS
ALTER TABLE public.seller_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view followers (for counting)
CREATE POLICY "Anyone can view followers" ON public.seller_followers
  FOR SELECT USING (true);

-- Authenticated users can follow
CREATE POLICY "Users can follow sellers" ON public.seller_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow sellers" ON public.seller_followers
  FOR DELETE USING (auth.uid() = follower_id);
