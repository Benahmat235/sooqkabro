-- Remove overly permissive realtime SELECT policy on messages
DROP POLICY IF EXISTS "authenticated_only_realtime" ON public.messages;

-- Ensure participant-only SELECT policy exists (recreate to be explicit)
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
CREATE POLICY "Conversation participants can view messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Ensure REPLICA IDENTITY FULL so realtime payloads include needed columns for RLS filtering
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Ensure messages table is part of the realtime publication (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
END$$;