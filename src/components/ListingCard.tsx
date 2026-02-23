import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Listing, formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import { getCategoryById } from "@/data/categories";

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const city = getCityById(listing.cityId);
  const category = getCategoryById(listing.categoryId);

  const daysAgo = Math.floor(
    (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeLabel = daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo}j`;

  return (
    <Link to={`/annonce/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {listing.featured && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold">
              ⭐ À la une
            </Badge>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-base font-bold text-primary mb-2">
            {formatPrice(listing.price)}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city?.name || listing.cityId}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLabel}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ListingCard;
