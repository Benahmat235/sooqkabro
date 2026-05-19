import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CalendarDays, Heart, ImageOff, MapPin, Zap, Crown, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import type { ListingWithImages } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { cardHoverVariants, heartVariants } from "@/lib/animations";
import type { PriceLevel } from "@/lib/pricing";

function optimizeImage(url: string, width: number): string {
  if (!url) return url;
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
  }
  // Supabase Storage image transformation (resize + WebP via Accept header)
  if (url.includes("/storage/v1/object/public/")) {
    const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    const sep = transformed.includes("?") ? "&" : "?";
    return `${transformed}${sep}width=${width}&quality=70&resize=contain`;
  }
  return url;
}

function formatListingDate(value: string): string {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "";

  const diffMs = Date.now() - createdAt.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays} j`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
  return createdAt.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

interface ListingCardProps {
  listing: ListingWithImages;
  compact?: boolean;
  priceLevel?: PriceLevel;
}

const ListingCard = ({ listing, compact = false, priceLevel }: ListingCardProps) => {
  const city = getCityById(listing.city_id);
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const isFav = favoriteIds.includes(listing.id);
  const [heartAnim, setHeartAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = listing.images[0] || "/placeholder.svg";
  const srcSmall = optimizeImage(imgSrc, 300);
  const locationLabel = [city?.name || listing.city_id, listing.quartier].filter(Boolean).join(" - ");
  const dateLabel = formatListingDate(listing.created_at);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    toggleFav.mutate({ listingId: listing.id, isFav });
  };

  const badge = listing.badge;
  const originalPrice = (listing as any).original_price as number | null;
  const hasDiscount = originalPrice && originalPrice > listing.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - listing.price) / originalPrice) * 100) : 0;
  const showBadge = hasDiscount ? "discount" : badge === "urgent" ? "urgent" : badge === "premium" ? "premium" : null;

  return (
    <Link 
      to={`/annonce/${listing.id}`} 
      className="group block h-full"
      aria-label={`${listing.title} - ${formatPrice(listing.price)}`}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="relative h-full rounded-xl overflow-hidden bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {/* Loading skeleton */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}

          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              <span className="text-[10px] font-medium">Image indisponible</span>
            </div>
          ) : (
            <motion.img
              src={srcSmall}
              alt={listing.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                !imgLoaded && "opacity-0 scale-105"
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(true);
              }}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          {showBadge === "urgent" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
            >
              <Zap className="h-2.5 w-2.5" fill="currentColor" />
              <span>URGENT</span>
            </motion.div>
          )}
          {showBadge === "premium" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="absolute top-2 left-2 bg-gradient-to-r from-[hsl(var(--chad-yellow))] to-amber-400 text-foreground text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
            >
              <Crown className="h-2.5 w-2.5" fill="currentColor" />
              <span>PRO</span>
            </motion.div>
          )}
          {showBadge === "discount" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-extrabold px-2 py-1 rounded-full shadow-lg"
            >
              -{discountPercent}%
            </motion.div>
          )}

          {/* Favorite Button */}
          <motion.button
            className="absolute top-2 right-2 bg-card/95 backdrop-blur-sm rounded-full p-1.5 shadow-lg ring-1 ring-border/50 hover:bg-card transition-colors z-10"
            onClick={handleFav}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <motion.div
              animate={heartAnim ? "liked" : "initial"}
              variants={heartVariants}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isFav 
                    ? "fill-[hsl(var(--chad-red))] text-[hsl(var(--chad-red))]" 
                    : "text-foreground/70 hover:text-foreground"
                )} 
              />
            </motion.div>
          </motion.button>

          {/* Price level badge (top-right under heart) */}
          {priceLevel === "good" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-10 right-2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md"
              title="Prix inférieur au marché"
            >
              <TrendingDown className="h-2.5 w-2.5" />
              <span>Bon prix</span>
            </motion.div>
          )}
          {priceLevel === "high" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-10 right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md"
              title="Prix supérieur au marché"
            >
              <TrendingUp className="h-2.5 w-2.5" />
              <span>Prix élevé</span>
            </motion.div>
          )}

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent pt-8 pb-2 px-2.5">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className={cn("truncate text-white font-extrabold drop-shadow-lg", compact ? "text-xs" : "text-sm")}>
                {formatPrice(listing.price)}
              </span>
              {hasDiscount && originalPrice && (
                <span className="text-white/70 text-[10px] font-medium line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className={cn("space-y-1.5", compact ? "p-2" : "p-2.5")}>
          <div className="flex min-w-0 items-start gap-1.5">
            <h3 className={cn("min-w-0 flex-1 font-semibold text-foreground line-clamp-2 leading-tight", compact ? "text-[11px]" : "text-xs")}>
              {listing.title}
            </h3>
            {listing.is_verified && (
              <BadgeCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                aria-label="Vendeur vérifié"
              />
            )}
          </div>
          <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate text-[10px]">{locationLabel}</span>
          </div>
          {dateLabel && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="text-[10px]">{dateLabel}</span>
            </div>
          )}
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 border-2 border-primary/0 hover:border-primary/20 rounded-xl transition-colors duration-300 pointer-events-none" />
      </motion.div>
    </Link>
  );
};

export default ListingCard;
