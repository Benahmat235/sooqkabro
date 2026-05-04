-- 1. Strengthen tamper-protection trigger to also lock the id column
CREATE OR REPLACE FUNCTION public.prevent_message_tampering()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Only the read flag may be updated on messages';
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is attached
DROP TRIGGER IF EXISTS prevent_message_tampering_trigger ON public.messages;
CREATE TRIGGER prevent_message_tampering_trigger
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_message_tampering();

-- 2. Column-level privileges: defense-in-depth at the SQL layer
-- Revoke broad UPDATE, then grant UPDATE only on the `read` column
REVOKE UPDATE ON public.messages FROM authenticated;
REVOKE UPDATE ON public.messages FROM anon;
GRANT UPDATE (read) ON public.messages TO authenticated;

-- Keep SELECT/INSERT as needed by RLS
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- 3. Tighten RLS UPDATE policy: recipient can only flip read from false -> true
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.messages;
CREATE POLICY "Recipients can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_id <> auth.uid()
  AND read = false
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
)
WITH CHECK (
  sender_id <> auth.uid()
  AND read = true
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
