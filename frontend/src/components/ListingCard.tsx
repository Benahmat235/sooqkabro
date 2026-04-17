import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Zap, Crown } from "lucide-react";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import type { ListingWithImages } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

function cloudinaryOptimize(url: string, width: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

interface ListingCardProps {
  listing: ListingWithImages;
  compact?: boolean;
}

const ListingCard = ({ listing, compact = false }: ListingCardProps) => {
  const city = getCityById(listing.city_id);
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const isFav = favoriteIds.includes(listing.id);
  const [heartAnim, setHeartAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const imgSrc = listing.images[0] || "/placeholder.svg";
  const srcSmall = cloudinaryOptimize(imgSrc, 300);

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
      className="block group"
      aria-label={`${listing.title} - ${formatPrice(listing.price)}`}
    >
      <div className="relative rounded-xl overflow-hidden bg-card border border-border/30 group-active:scale-[0.97] transition-transform">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={srcSmall}
            alt={listing.title}
            className={cn(
              "w-full h-full object-cover",
              !imgLoaded && "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Badge */}
          {showBadge === "urgent" && (
            <div className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" />URGENT
            </div>
          )}
          {showBadge === "premium" && (
            <div className="absolute top-1.5 left-1.5 bg-[hsl(var(--chad-yellow))] text-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Crown className="h-2.5 w-2.5" />PRO
            </div>
          )}
          {showBadge === "discount" && (
            <div className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              -{discountPercent}%
            </div>
          )}

          {/* Favorite */}
          <button
            className="absolute top-1.5 right-1.5 bg-card/80 backdrop-blur-sm rounded-full p-1.5 active:scale-90 transition-transform"
            onClick={handleFav}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={cn(
              "h-3.5 w-3.5 transition-all",
              isFav ? "fill-[hsl(var(--chad-red))] text-[hsl(var(--chad-red))]" : "text-muted-foreground",
              heartAnim && "animate-heart-pop"
            )} />
          </button>

          {/* Price overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-1.5 px-2">
            <span className="text-white text-xs font-bold drop-shadow-sm">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-1.5">
          <p className="text-[10px] font-medium text-foreground line-clamp-1 leading-tight">
            {listing.title}
          </p>
          <div className="flex items-center gap-0.5 mt-0.5">
            <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
            <span className="text-[9px] text-muted-foreground truncate">{city?.name || listing.city_id}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
