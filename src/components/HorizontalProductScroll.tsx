import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatPrice } from "@/data/mockListings";
import type { ListingWithImages } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useState } from "react";

function cloudinaryOptimize(url: string, width: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

interface HorizontalProductScrollProps {
  title: string;
  subtitle?: string;
  listings: ListingWithImages[];
  viewAllLink?: string;
  showPriceComparison?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

const HorizontalProductScroll = ({
  title,
  subtitle,
  listings,
  viewAllLink,
  showPriceComparison = false,
  icon,
  accentColor = "text-primary",
}: HorizontalProductScrollProps) => {
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();

  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={cn("text-lg font-extrabold text-foreground", accentColor)}>{title}</h2>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline focus-ring rounded-lg px-2 py-1"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {listings.map((listing, i) => (
            <HorizontalProductCard
              key={listing.id}
              listing={listing}
              index={i}
              isFav={favoriteIds.includes(listing.id)}
              onToggleFav={() => toggleFav.mutate({ listingId: listing.id, isFav: favoriteIds.includes(listing.id) })}
              showPriceComparison={showPriceComparison}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

interface HorizontalProductCardProps {
  listing: ListingWithImages;
  index: number;
  isFav: boolean;
  onToggleFav: () => void;
  showPriceComparison?: boolean;
}

const HorizontalProductCard = ({
  listing,
  index,
  isFav,
  onToggleFav,
  showPriceComparison,
}: HorizontalProductCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const imgSrc = listing.images[0] || "/placeholder.svg";
  const srcSmall = cloudinaryOptimize(imgSrc, 300);

  const originalPrice = (listing as any).original_price as number | null;
  const hasDiscount = originalPrice && originalPrice > listing.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - listing.price) / originalPrice) * 100) : 0;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    onToggleFav();
  };

  return (
    <Link
      to={`/annonce/${listing.id}`}
      className="block shrink-0 w-[160px] group animate-fade-in focus-ring rounded-2xl"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
    >
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={srcSmall}
            alt={listing.title}
            className={cn(
              "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
              !imgLoaded && "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPercent}%
            </div>
          )}

          {/* Favorite */}
          <button
            className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-card transition-all focus-ring"
            onClick={handleFav}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all",
                isFav ? "fill-[hsl(var(--chad-red))] text-[hsl(var(--chad-red))]" : "text-muted-foreground",
                heartAnim && "animate-heart-pop"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-base font-extrabold text-destructive">
              {formatPrice(listing.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {listing.title}
          </p>

          {/* Price comparison hint */}
          {showPriceComparison && (
            <p className="text-[10px] text-green-600 mt-1.5 font-medium">
              Prix inferieur aux produits similaires
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HorizontalProductScroll;
