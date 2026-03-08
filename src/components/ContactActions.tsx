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
        {isVerified ? (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button
              variant="outline"
              className="w-full h-13 font-bold text-sm rounded-2xl gap-2 border-2 border-border hover:bg-accent/50 shadow-lg transition-all active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-success" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </Button>
          </a>
        ) : (
          <Button
            onClick={canChat ? onChat : undefined}
            disabled={isChatDisabled || !canChat}
            variant="outline"
            className="w-full h-13 font-bold text-sm rounded-2xl gap-2 border-2 border-border hover:bg-accent/50 shadow-lg transition-all active:scale-[0.97]"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Discuter</span>
          </Button>
        )}
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
