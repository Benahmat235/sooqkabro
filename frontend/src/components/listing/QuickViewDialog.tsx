import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, ChevronLeft, ChevronRight, ExternalLink, BadgeCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { getCityById } from "@/data/cities";
import { cn } from "@/lib/utils";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import type { ListingWithImages } from "@/hooks/useListings";

interface Props {
  listing: ListingWithImages;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function optimizeImage(url: string, width: number): string {
  if (!url) return url;
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
  }
  return url;
}

const QuickViewDialog = ({ listing, open, onOpenChange }: Props) => {
  const [idx, setIdx] = useState(0);
  const city = getCityById(listing.city_id);
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const isFav = favoriteIds.includes(listing.id);

  const images = listing.images.length > 0 ? listing.images : ["/placeholder.svg"];
  const current = optimizeImage(images[Math.min(idx, images.length - 1)], 800);

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  const hasDiscount = listing.original_price && listing.original_price > listing.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl gap-0">
        <DialogTitle className="sr-only">{listing.title}</DialogTitle>
        <DialogDescription className="sr-only">Aperçu rapide de l'annonce</DialogDescription>

        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted">
          <img
            src={current}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Image précédente"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur p-1.5 rounded-full shadow"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Image suivante"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur p-1.5 rounded-full shadow"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all",
                      i === idx ? "bg-white w-3" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => toggleFav.mutate({ listingId: listing.id, isFav })}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="absolute top-2 right-2 bg-card/95 backdrop-blur p-2 rounded-full shadow ring-1 ring-border/50"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFav ? "fill-[hsl(var(--chad-red))] text-[hsl(var(--chad-red))]" : "text-foreground/70"
              )}
            />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <h3 className="text-base font-extrabold text-foreground flex-1 leading-tight">
              {listing.title}
            </h3>
            {listing.is_verified && (
              <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label="Vendeur vérifié" />
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-primary">{formatPrice(listing.price)}</span>
            {hasDiscount && listing.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(listing.original_price)}
              </span>
            )}
          </div>

          {city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{[city.name, listing.quartier].filter(Boolean).join(" - ")}</span>
            </div>
          )}

          {listing.description && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {listing.description}
            </p>
          )}

          <Button asChild className="w-full rounded-xl h-11 font-bold gap-2 mt-1">
            <Link to={`/annonce/${listing.id}`} onClick={() => onOpenChange(false)}>
              <ExternalLink className="h-4 w-4" />
              Voir l'annonce complète
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewDialog;
