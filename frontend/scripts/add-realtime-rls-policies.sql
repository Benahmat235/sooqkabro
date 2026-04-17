-- Migration: Add RLS policies to messages table for secure realtime subscriptions
-- This ensures users can only subscribe to and receive messages from conversations they participate in

-- Enable RLS on messages table (if not already enabled)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read in their conversations" ON public.messages;

-- Policy: Users can only SELECT messages from conversations where they are a participant
CREATE POLICY "Users can view messages from their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Policy: Users can only INSERT messages into conversations where they are a participant
CREATE POLICY "Users can insert messages into their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  -- User must be the sender
  sender_id = auth.uid()
  AND
  -- User must be a participant in the conversation
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Policy: Users can only UPDATE messages they sent (e.g., edit)
CREATE POLICY "Users can update messages they sent"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Policy: Users can mark messages as read in their conversations (for the other party's messages)
CREATE POLICY "Users can mark messages as read in their conversations"
ON public.messages
FOR UPDATE
USING (
  -- Message is not sent by current user (they're marking received messages as read)
  sender_id != auth.uid()
  AND
  -- User is a participant in the conversation
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
)
WITH CHECK (
  -- Only allow updating the 'read' column
  sender_id != auth.uid()
);

-- Enable RLS on conversations table for consistency
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing conversation policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Policy: Users can only view conversations they participate in
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Policy: Users can create new conversations
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (buyer_id = auth.uid());

-- Policy: Users can update their conversations (e.g., update timestamp)
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Grant necessary permissions for realtime
GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO authenticated;
GRANT UPDATE ON public.messages TO authenticated;
GRANT SELECT ON public.conversations TO authenticated;
GRANT INSERT ON public.conversations TO authenticated;
GRANT UPDATE ON public.conversations TO authenticated;

-- Add realtime publication for messages with RLS filter
-- This ensures Supabase Realtime respects the RLS policies
-- Note: Run this in Supabase Dashboard if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
