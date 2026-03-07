import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePhoneValidation() {
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  const validatePhone = useCallback(async (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 8) {
      setPhoneValid(null);
      return;
    }

    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-phone", {
        body: { phone: cleaned },
      });
      if (error) throw error;
      setPhoneValid(data?.valid === true);
    } catch {
      // On error, don't block — assume valid
      setPhoneValid(null);
    } finally {
      setValidating(false);
    }
  }, []);

  const resetValidation = useCallback(() => setPhoneValid(null), []);

  return { phoneValid, validating, validatePhone, resetValidation };
}
