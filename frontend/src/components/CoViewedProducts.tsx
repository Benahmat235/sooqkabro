import { useRef } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { useCoViewedListings } from "@/hooks/useCoViewedListings";
import type { ListingWithImages } from "@/hooks/useListings";

interface Props {
  listingId: string;
}

const CoViewedProducts = ({ listingId }: Props) => {
  const { data = [], isLoading } = useCoViewedListings(listingId, 6);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading || data.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <section className="py-6 border-t">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">
            Vu également par d'autres acheteurs
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll("left")} className="p-2 rounded-full bg-muted hover:bg-accent" aria-label="Scroll left">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full bg-muted hover:bg-accent" aria-label="Scroll right">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
        {data.map((l, i) => {
          // Adapt to ListingWithImages shape (provide minimal fields used by ListingCard)
          const listing = {
            ...l,
            user_id: "",
            description: "",
            phone: "",
            quartier: null,
            updated_at: l.created_at,
            original_price: null,
            content_hash: null,
            is_verified: false,
          } as unknown as ListingWithImages;
          return (
            <div
              key={l.id}
              className="shrink-0 w-[160px] sm:w-[180px] snap-start animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ListingCard listing={listing} compact />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CoViewedProducts;
