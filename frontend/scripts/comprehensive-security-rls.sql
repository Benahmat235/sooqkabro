-- ============================================================================
-- COMPREHENSIVE SECURITY MIGRATION FOR SOOQKABRO
-- Run this script in Supabase SQL Editor to apply all security policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: CRITICAL - OTP Codes Protection
-- ============================================================================

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_codes_user_only" ON public.otp_codes;
CREATE POLICY "otp_codes_user_only" ON public.otp_codes
FOR ALL USING (
  phone = (SELECT phone FROM public.profiles WHERE id = auth.uid())
);

-- ============================================================================
-- SECTION 2: CRITICAL - User Roles Protection
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
CREATE POLICY "user_roles_admin_all" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Users can view their own roles
DROP POLICY IF EXISTS "user_roles_view_own" ON public.user_roles;
CREATE POLICY "user_roles_view_own" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: HIGH PRIORITY - Listings Protection
-- ============================================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view published listings
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings
FOR SELECT USING (
  status = 'published' OR user_id = auth.uid()
);

-- Only authenticated users can create listings
DROP POLICY IF EXISTS "listings_insert_auth" ON public.listings;
CREATE POLICY "listings_insert_auth" ON public.listings
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Only owners can update their listings
DROP POLICY IF EXISTS "listings_update_owner" ON public.listings;
CREATE POLICY "listings_update_owner" ON public.listings
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only owners can delete their listings
DROP POLICY IF EXISTS "listings_delete_owner" ON public.listings;
CREATE POLICY "listings_delete_owner" ON public.listings
FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 4: HIGH PRIORITY - Profiles Protection
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can view basic profile info (name, avatar, verification status)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
FOR SELECT USING (true);

-- Note: Phone number access should be restricted at application level
-- Consider creating a view that masks phone numbers for non-participants

-- Only users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only authenticated users can insert their profile (on signup)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- SECTION 5: Favorites Protection
-- ============================================================================

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own favorites
DROP POLICY IF EXISTS "favorites_user_all" ON public.favorites;
CREATE POLICY "favorites_user_all" ON public.favorites
FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 6: Seller Reviews Protection
-- ============================================================================

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
DROP POLICY IF EXISTS "reviews_select_public" ON public.seller_reviews;
CREATE POLICY "reviews_select_public" ON public.seller_reviews
FOR SELECT USING (true);

-- Only authenticated users can create reviews (not for themselves)
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.seller_reviews;
CREATE POLICY "reviews_insert_auth" ON public.seller_reviews
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND reviewer_id = auth.uid() 
  AND seller_id != auth.uid()
);

-- Users can update their own reviews
DROP POLICY IF EXISTS "reviews_update_own" ON public.seller_reviews;
CREATE POLICY "reviews_update_own" ON public.seller_reviews
FOR UPDATE USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Users can delete their own reviews
DROP POLICY IF EXISTS "reviews_delete_own" ON public.seller_reviews;
CREATE POLICY "reviews_delete_own" ON public.seller_reviews
FOR DELETE USING (reviewer_id = auth.uid());

-- ============================================================================
-- SECTION 7: Listing Images Protection
-- ============================================================================

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view listing images
DROP POLICY IF EXISTS "listing_images_select" ON public.listing_images;
CREATE POLICY "listing_images_select" ON public.listing_images
FOR SELECT USING (true);

-- Only listing owners can manage images
DROP POLICY IF EXISTS "listing_images_insert" ON public.listing_images;
CREATE POLICY "listing_images_insert" ON public.listing_images
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "listing_images_update" ON public.listing_images;
CREATE POLICY "listing_images_update" ON public.listing_images
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "listing_images_delete" ON public.listing_images;
CREATE POLICY "listing_images_delete" ON public.listing_images
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_id AND user_id = auth.uid()
  )
);

-- ============================================================================
-- SECTION 8: Listing Views Protection
-- ============================================================================

ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Anyone can record a view
DROP POLICY IF EXISTS "listing_views_insert" ON public.listing_views;
CREATE POLICY "listing_views_insert" ON public.listing_views
FOR INSERT WITH CHECK (true);

-- Only listing owners can see detailed view analytics
DROP POLICY IF EXISTS "listing_views_select" ON public.listing_views;
CREATE POLICY "listing_views_select" ON public.listing_views
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_id AND user_id = auth.uid()
  )
);

-- ============================================================================
-- SECTION 9: Messages Protection (verify existing)
-- ============================================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can only view messages from their conversations
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Users can only send messages to conversations they participate in
DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Users can mark messages as read in their conversations
DROP POLICY IF EXISTS "messages_update_read" ON public.messages;
CREATE POLICY "messages_update_read" ON public.messages
FOR UPDATE USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- ============================================================================
-- SECTION 10: Conversations Protection (verify existing)
-- ============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only view their conversations
DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations
FOR SELECT USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- Users can create conversations as buyers
DROP POLICY IF EXISTS "conversations_insert_buyer" ON public.conversations;
CREATE POLICY "conversations_insert_buyer" ON public.conversations
FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Participants can update conversation timestamp
DROP POLICY IF EXISTS "conversations_update_participant" ON public.conversations;
CREATE POLICY "conversations_update_participant" ON public.conversations
FOR UPDATE USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- ============================================================================
-- SECTION 11: Grant Permissions for Authenticated Users
-- ============================================================================

GRANT SELECT ON public.listings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;

GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT ALL ON public.favorites TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_reviews TO authenticated;

GRANT SELECT ON public.listing_images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_images TO authenticated;

GRANT SELECT, INSERT ON public.listing_views TO authenticated;

GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.otp_codes TO authenticated;

GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================================================
-- SECTION 12: Storage Bucket Policies (if using Supabase Storage)
-- ============================================================================

-- Note: Run these in Supabase Dashboard > Storage > Policies

-- For listing images bucket:
-- SELECT: Allow public access to listing images
-- INSERT: Only authenticated users can upload
-- UPDATE/DELETE: Only file owners can modify

-- Example policy for INSERT:
-- ((bucket_id = 'listings'::text) AND (auth.role() = 'authenticated'::text))

-- ============================================================================
-- SECTION 13: Security Helper Functions
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is conversation participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conv_id AND (buyer_id = user_id OR seller_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a listing
CREATE OR REPLACE FUNCTION public.owns_listing(listing_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_id AND listings.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 14: Admin Override Policies
-- ============================================================================

-- Admins can manage all listings
DROP POLICY IF EXISTS "listings_admin_all" ON public.listings;
CREATE POLICY "listings_admin_all" ON public.listings
FOR ALL USING (
  public.is_moderator_or_admin(auth.uid())
);

-- Admins can manage all conversations (for support purposes)
DROP POLICY IF EXISTS "conversations_admin_select" ON public.conversations;
CREATE POLICY "conversations_admin_select" ON public.conversations
FOR SELECT USING (
  public.is_admin(auth.uid())
);

-- ============================================================================
-- SECTION 15: Audit Logging Table (Optional)
-- ============================================================================

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  target_table TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_log_admin_only" ON public.security_audit_log
FOR SELECT USING (public.is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "audit_log_insert" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_target_table TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (event_type, user_id, target_table, target_id, details)
  VALUES (p_event_type, auth.uid(), p_target_table, p_target_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify RLS is enabled on all tables:
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all policies:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify security functions exist:
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%' OR routine_name LIKE '%security%'
ORDER BY routine_name;
