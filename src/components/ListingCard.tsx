import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import type { ListingWithImages } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

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
          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-1">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">
              {city?.name || listing.city_id}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
