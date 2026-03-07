import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  phoneValid: boolean | null;
  validating: boolean;
  onBlur: () => void;
  className?: string;
}

const PhoneValidationIndicator = ({ phoneValid, validating }: { phoneValid: boolean | null; validating: boolean }) => {
  if (validating) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (phoneValid === true) return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (phoneValid === false) return <XCircle className="h-4 w-4 text-destructive" />;
  return null;
};

export { PhoneValidationIndicator };
