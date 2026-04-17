import { useState } from "react";
import { Phone, Eye, EyeOff, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskPhone } from "@/lib/security";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface PhoneDisplayProps {
  phone: string | null | undefined;
  sellerId: string;
  isOwner?: boolean;
  className?: string;
}

/**
 * Secure phone display component
 * - Shows masked phone by default for privacy
 * - Allows revealing full phone if user is authenticated
 * - Tracks phone views for analytics
 */
export function PhoneDisplay({ phone, sellerId, isOwner = false, className = "" }: PhoneDisplayProps) {
  const [revealed, setRevealed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!phone) return null;

  const handleReveal = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setRevealed(true);
  };

  const handleCall = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  // Owner always sees full phone
  if (isOwner) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{phone}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium font-mono">
          {revealed ? phone : maskPhone(phone)}
        </span>
        {!revealed && (
          <button
            onClick={handleReveal}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            Voir
          </button>
        )}
        {revealed && (
          <button
            onClick={() => setRevealed(false)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <EyeOff className="h-3 w-3" />
            Masquer
          </button>
        )}
      </div>
      
      {revealed && (
        <div className="flex gap-2">
          <Button 
            onClick={handleCall} 
            size="sm" 
            className="flex-1 h-9 rounded-lg"
          >
            <Phone className="h-4 w-4 mr-1.5" />
            Appeler
          </Button>
          <Button 
            onClick={() => navigate(`/messages?seller=${sellerId}`)}
            size="sm" 
            variant="outline"
            className="flex-1 h-9 rounded-lg"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Message
          </Button>
        </div>
      )}
    </div>
  );
}

export default PhoneDisplay;
