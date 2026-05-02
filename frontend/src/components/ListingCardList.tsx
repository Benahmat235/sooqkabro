import ListingCard from "./ListingCard";
import type { ListingWithImages } from "@/hooks/useListings";
import { usePriceStatsBatch } from "@/hooks/usePriceStats";
import { classifyPrice } from "@/lib/pricing";

interface Props {
  listings: ListingWithImages[];
  className?: string;
  /** Render prop : container layout. Defaults to 3-col grid (mobile-first). */
  children?: (cards: React.ReactNode) => React.ReactNode;
}

/**
 * Renders a list of ListingCard with automatic "Bon prix" / "Prix élevé"
 * badges, fetched via getPriceStats edge function (batched + cached 1h).
 */
export function ListingCardList({ listings, className, children }: Props) {
  const { data: statsMap } = usePriceStatsBatch(
    listings.map((l) => ({ category_id: l.category_id, subcategory_id: l.subcategory_id }))
  );

  const cards = listings.map((l) => {
    const key = `${l.category_id}::${l.subcategory_id ?? ""}`;
    const stats = statsMap?.get(key);
    const level = classifyPrice(l.price, stats);
    return <ListingCard key={l.id} listing={l} priceLevel={level} />;
  });

  if (children) return <>{children(cards)}</>;

  return (
    <div className={className ?? "grid grid-cols-3 gap-2"}>
      {cards}
    </div>
  );
}

export default ListingCardList;
