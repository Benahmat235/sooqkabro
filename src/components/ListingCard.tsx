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

  return (
    <Link to={`/annonce/${listing.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2">
            <span className="bg-foreground/80 text-card px-2 py-0.5 rounded text-xs font-bold">
              {formatPrice(listing.price)}
            </span>
          </div>
          <button
            className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav.mutate({ listingId: listing.id, isFav });
            }}
          >
            <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-muted-foreground")} />
          </button>
        </div>
        <div className="p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {city?.name || listing.city_id}
              {listing.quartier ? ` · ${listing.quartier}` : ""}
            </span>
          </div>
          <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
            {listing.title}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
