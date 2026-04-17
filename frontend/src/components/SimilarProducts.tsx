import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ListingWithImages } from "@/hooks/useListings";
import ListingCard from "@/components/ListingCard";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

interface SimilarProductsProps {
  currentListing: ListingWithImages;
  allListings: ListingWithImages[];
  maxItems?: number;
}

const SimilarProducts = ({ currentListing, allListings, maxItems = 10 }: SimilarProductsProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const similarListings = useMemo(() => {
    // Score-based similarity algorithm
    const scored = allListings
      .filter((l) => l.id !== currentListing.id)
      .map((listing) => {
        let score = 0;

        // Same category (high priority)
        if (listing.category_id === currentListing.category_id) {
          score += 50;
          // Same subcategory (even higher)
          if (listing.subcategory_id === currentListing.subcategory_id) {
            score += 30;
          }
        }

        // Same city
        if (listing.city_id === currentListing.city_id) {
          score += 15;
        }

        // Similar price range (within 30%)
        const priceDiff = Math.abs(listing.price - currentListing.price) / currentListing.price;
        if (priceDiff <= 0.3) {
          score += 20 * (1 - priceDiff);
        }

        // Recency bonus (newer items get slight boost)
        const daysSinceCreated = (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) {
          score += 5;
        }

        // Verified seller bonus
        if (listing.is_verified) {
          score += 5;
        }

        return { listing, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map((item) => item.listing);

    return scored;
  }, [allListings, currentListing, maxItems]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (similarListings.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">{t("listings.similar")}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory"
      >
        {similarListings.map((listing, index) => (
          <div
            key={listing.id}
            className={cn(
              "shrink-0 w-[160px] sm:w-[180px] snap-start animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ListingCard listing={listing} compact />
          </div>
        ))}
      </div>

      {similarListings.length >= 6 && (
        <div className="px-4 mt-3">
          <Link
            to={`/categorie/${currentListing.category_id}`}
            className="block text-center text-sm text-primary font-semibold hover:underline"
          >
            Voir plus dans cette categorie
          </Link>
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
