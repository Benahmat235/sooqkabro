import { useState } from "react";
import { Phone, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

interface ContactActionsProps {
  isVerified: boolean;
  whatsappLink: string;
  callLink: string;
  phoneFormatted: string;
  onChat: () => void;
  isChatDisabled?: boolean;
  canChat: boolean;
  sellerName?: string;
}

function maskPhone(formatted: string): string {
  let count = 0;
  const chars = formatted.split("");
  for (let i = chars.length - 1; i >= 0 && count < 2; i--) {
    if (/\d/.test(chars[i])) {
      chars[i] = "X";
      count++;
    }
  }
  return chars.join("");
}

const ContactActions = ({
  isVerified,
  whatsappLink,
  callLink,
  phoneFormatted,
  onChat,
  isChatDisabled,
  canChat,
  sellerName,
}: ContactActionsProps) => {
  const [revealed, setRevealed] = useState(false);
  const { t } = useTranslation();

  const handleCallClick = () => {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    window.location.href = callLink;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {isVerified && (
        <div className="flex items-center gap-1.5 mb-2 justify-center">
          <CheckCircle className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            {sellerName || t("contact.merchant")} {t("contact.verified")}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCallClick}
          className="w-full h-13 font-bold text-sm rounded-2xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all active:scale-[0.97]"
        >
          <Phone className="h-5 w-5" />
          <span className="truncate">
            {revealed ? phoneFormatted : maskPhone(phoneFormatted)}
          </span>
        </Button>

        <Button
          onClick={onChat}
          disabled={isChatDisabled}
          variant="outline"
          className="w-full h-13 font-bold text-sm rounded-2xl gap-2 border-2 border-border hover:bg-accent/50 shadow-lg transition-all active:scale-[0.97]"
        >
          <MessageSquare className="h-5 w-5" />
          <span>{t("contact.chat")}</span>
        </Button>
      </div>
    </div>
  );
};

export default ContactActions;
