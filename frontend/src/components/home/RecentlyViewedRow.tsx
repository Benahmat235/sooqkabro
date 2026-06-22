import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { ListingWithImages } from "@/hooks/useListings";

type RawRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string;
  subcategory_id: string;
  city_id: string;
  quartier: string | null;
  status: string;
  created_at: string;
  badge: string | null;
  listing_images?: { image_url: string; position: number }[];
};

const RecentlyViewedRow = () => {
  const { ids } = useRecentlyViewed();
  const [items, setItems] = useState<ListingWithImages[]>([]);

  useEffect(() => {
    if (ids.length < 3) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, user_id, title, description, price, original_price, category_id, subcategory_id, city_id, quartier, status, created_at, badge, listing_images(image_url, position)"
        )
        .in("id", ids)
        .eq("status", "published");
      if (error || cancelled) return;
      const rows = (data || []) as unknown as RawRow[];
      const byId = new Map(rows.map((r) => [r.id, r]));
      // Preserve the order from `ids`
      const ordered: ListingWithImages[] = ids
        .map((id) => byId.get(id))
        .filter((r): r is RawRow => !!r)
        .map((r) => ({
          ...r,
          description: r.description || "",
          images: (r.listing_images || [])
            .sort((a, b) => a.position - b.position)
            .map((i) => i.image_url),
        }));
      setItems(ordered);
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (items.length < 3) return null;

  return (
    <section className="py-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-blue-100 shadow-sm">
          <Eye className="h-4 w-4 text-blue-700" />
        </div>
        <h2 className="text-sm font-extrabold text-foreground">Vus récemment</h2>
        <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-3 px-3 pb-1">
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} variant="square" />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedRow;
