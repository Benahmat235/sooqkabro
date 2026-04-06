-- Create seller_followers table for the follow/subscribe feature
CREATE TABLE IF NOT EXISTS seller_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seller_id, follower_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_seller_followers_seller_id ON seller_followers(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_followers_follower_id ON seller_followers(follower_id);

-- Enable RLS
ALTER TABLE seller_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view followers count
CREATE POLICY "Anyone can view followers" ON seller_followers
  FOR SELECT USING (true);

-- Policy: Authenticated users can follow/unfollow
CREATE POLICY "Users can follow sellers" ON seller_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow sellers" ON seller_followers
  FOR DELETE USING (auth.uid() = follower_id);
