-- Restrict realtime.messages so authenticated users can only subscribe to topics
-- of the form 'conversation:<id>' where they are a participant.
DROP POLICY IF EXISTS "authenticated_only_realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Conversation participants can subscribe" ON realtime.messages;

CREATE POLICY "Conversation participants can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = split_part(realtime.topic(), ':', 2)
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);