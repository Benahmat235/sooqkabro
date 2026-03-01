
-- Create a secure function to get a seller's verified phone
CREATE OR REPLACE FUNCTION public.get_seller_phone(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT phone FROM public.profiles WHERE id = _user_id;
$$;
