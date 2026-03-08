import { useState } from "react";
import { Phone, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Replace last 2 digits with XX
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

  const handleCallClick = () => {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    // Already revealed — initiate call
    window.location.href = callLink;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {/* Verified badge */}
      {isVerified && (
        <div className="flex items-center gap-1.5 mb-2 justify-center">
          <CheckCircle className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            {sellerName || "Marchand"} est vérifié
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Call button — masked number, reveal on first click */}
        <Button
          onClick={handleCallClick}
          className="w-full h-13 font-bold text-sm rounded-2xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all active:scale-[0.97]"
        >
          <Phone className="h-5 w-5" />
          <span className="truncate">
            {revealed ? phoneFormatted : maskPhone(phoneFormatted)}
          </span>
        </Button>

        {/* Chat / WhatsApp button */}
        <Button
          onClick={onChat}
          disabled={isChatDisabled}
          variant="outline"
          className="w-full h-13 font-bold text-sm rounded-2xl gap-2 border-2 border-border hover:bg-accent/50 shadow-lg transition-all active:scale-[0.97]"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Discuter</span>
        </Button>
      </div>

      {!canChat && !isVerified && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Connectez-vous pour discuter avec le vendeur
        </p>
      )}
    </div>
  );
};

export default ContactActions;
