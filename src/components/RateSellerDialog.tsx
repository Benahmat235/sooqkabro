import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useSellerReviews";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RateSellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  reviewerId: string;
}

export default function RateSellerDialog({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  sellerAvatar,
  reviewerId,
}: RateSellerDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez selectionner une note avant de soumettre.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitReview.mutateAsync({
        sellerId,
        reviewerId,
        rating,
        comment,
      });
      toast({
        title: "Merci pour votre avis !",
        description: "Votre evaluation a ete enregistree avec succes.",
      });
      onClose();
      setRating(0);
      setComment("");
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez reessayer.",
        variant: "destructive",
      });
    }
  };

  const ratingLabels = [
    "",
    "Tres mauvais",
    "Mauvais",
    "Moyen",
    "Bon",
    "Excellent",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-auto p-6 animate-slide-up shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
            <img
              src={sellerAvatar || "/placeholder.svg"}
              alt={sellerName}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-foreground">Evaluer {sellerName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Partagez votre experience avec ce vendeur
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))]"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <p className="text-sm font-medium text-foreground animate-fade-in">
              {ratingLabels[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Decrivez votre experience (optionnel)..."
            className="min-h-[100px] rounded-xl resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-12"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitReview.isPending}
            className="flex-1 rounded-xl h-12"
          >
            {submitReview.isPending ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
