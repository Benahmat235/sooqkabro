-- INSERT: only authenticated participants, sender must be self
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
CREATE POLICY "Conversation participants can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- UPDATE: only the recipient can mark as read; cannot change sender/content/conversation
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
CREATE POLICY "Recipients can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_id <> auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
)
WITH CHECK (
  sender_id <> auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Trigger to prevent modification of immutable fields (only `read` can change)
CREATE OR REPLACE FUNCTION public.prevent_message_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the read flag may be updated on messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_message_tampering_trg ON public.messages;
CREATE TRIGGER prevent_message_tampering_trg
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.prevent_message_tampering();