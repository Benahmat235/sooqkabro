import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Zap, Crown, TrendingDown, TrendingUp } from "lucide-react";
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

  const imgSrc = listing.images[0] || "/placeholder.svg";
  const srcSmall = optimizeImage(imgSrc, 300);

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
      className="block"
      aria-label={`${listing.title} - ${formatPrice(listing.price)}`}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="relative rounded-xl overflow-hidden bg-card border border-border/30 shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          
          <motion.img
            src={srcSmall}
            alt={listing.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              !imgLoaded && "opacity-0 scale-105"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />

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
            className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-card transition-colors z-10"
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

          {/* Price Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-8 pb-2 px-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white text-sm font-extrabold drop-shadow-lg">
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
        <div className="p-2">
          <h3 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight mb-1">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-[9px] truncate">{city?.name || listing.city_id}</span>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 border-2 border-primary/0 hover:border-primary/20 rounded-xl transition-colors duration-300 pointer-events-none" />
      </motion.div>
    </Link>
  );
};

export default ListingCard;
