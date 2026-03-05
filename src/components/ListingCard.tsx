import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Eye, Clock, BadgeCheck, Zap, Crown } from "lucide-react";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import type { ListingWithImages } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ListingCardProps {
  listing: ListingWithImages;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const city = getCityById(listing.city_id);
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const isFav = favoriteIds.includes(listing.id);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    toggleFav.mutate({ listingId: listing.id, isFav });
  };

  const timeAgo = listing.created_at
    ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: false, locale: fr })
    : "";

  const badge = (listing as any).badge;

  return (
    <Link to={`/annonce/${listing.id}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden bg-card shadow-card group-hover:shadow-card-hover transition-all duration-300 group-active:scale-[0.98]">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={listing.images[0] || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badge promotion */}
          {badge === "urgent" && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Zap className="h-2.5 w-2.5" />URGENT
            </div>
          )}
          {badge === "premium" && (
            <div className="absolute top-2 left-2 bg-[hsl(var(--chad-yellow))] text-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Crown className="h-2.5 w-2.5" />PREMIUM
            </div>
          )}
          {/* Price badge */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent pt-6 pb-2 px-2">
            <span className="text-card text-xs font-extrabold drop-shadow-sm">
              {formatPrice(listing.price)}
            </span>
          </div>
          {/* Favorite button */}
          <button
            className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-card transition-all active:scale-90"
            onClick={handleFav}
          >
            <Heart className={cn(
              "h-3.5 w-3.5 transition-all",
              isFav ? "fill-chad-red text-chad-red" : "text-muted-foreground",
              heartAnim && "animate-heart-pop"
            )} />
          </button>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-1.5">
            {listing.title}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{city?.name || listing.city_id}</span>
          </div>
          {/* Stats: time + views */}
          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground/70">
            {timeAgo && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {timeAgo}
              </span>
            )}
            {(listing as any).view_count !== undefined && (
              <span className="flex items-center gap-0.5">
                <Eye className="h-2.5 w-2.5" />
                {(listing as any).view_count}
              </span>
            )}
            {(listing as any).is_verified && (
              <BadgeCheck className="h-3 w-3 text-primary ml-auto" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
