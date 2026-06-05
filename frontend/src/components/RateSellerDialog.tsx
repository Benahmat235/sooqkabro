import { useState } from "react";
import { Star, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// Shoppe-style rate dialog: large stars, pill textarea ("Say it!"), full-width Next button,
// followed by a "Done!" success screen with animated stars.
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
  const [done, setDone] = useState(false);
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const reset = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setDone(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note avant de soumettre.",
        variant: "destructive",
      });
      return;
    }
    try {
      await submitReview.mutateAsync({ sellerId, reviewerId, rating, comment });
      setDone(true);
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const ratingLabels = ["", "Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-background rounded-t-[28px] sm:rounded-3xl w-full sm:max-w-md mx-auto p-6 pb-8 shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-7 mt-2">
                <h2 className="text-2xl font-extrabold text-foreground">Rate Our Service</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Partagez votre expérience avec{" "}
                  <span className="font-semibold text-foreground">{sellerName}</span>
                </p>
              </div>

              {/* XL Stars */}
              <div className="flex flex-col items-center mb-7">
                <div className="flex gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoveredRating || rating) >= star;
                    return (
                      <motion.button
                        key={star}
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1"
                        aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={cn(
                            "h-11 w-11 transition-all duration-200",
                            active
                              ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))] drop-shadow-md"
                              : "text-muted-foreground/25",
                          )}
                          strokeWidth={1.5}
                        />
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-sm font-semibold text-foreground h-5">
                  {(hoveredRating || rating) > 0 ? ratingLabels[hoveredRating || rating] : ""}
                </p>
              </div>

              {/* Pill textarea */}
              <div className="mb-6">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Say it!"
                  className="min-h-[120px] rounded-3xl bg-muted/60 border-0 resize-none p-4 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/30"
                />
              </div>

              {/* Full-width Next button */}
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitReview.isPending}
                className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/20"
              >
                {submitReview.isPending ? "Envoi..." : "Next"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 14 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
              >
                <Check className="h-10 w-10 text-primary" strokeWidth={3} />
              </motion.div>
              <h2 className="text-3xl font-extrabold text-foreground mb-2">Done!</h2>
              <p className="text-sm text-muted-foreground mb-6">Merci pour votre avis</p>

              {/* Animated star burst */}
              <div className="flex justify-center gap-1.5 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + s * 0.08, type: "spring", stiffness: 300 }}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        s <= rating
                          ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))]"
                          : "text-muted-foreground/20",
                      )}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-14 rounded-full text-base font-bold"
              >
                Continuer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
