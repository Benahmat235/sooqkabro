import { useState } from "react";
import { Heart, Lightbulb, Flame, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ListingCard from "./ListingCard";
import type { ListingWithImages } from "@/hooks/useListings";

const tabs = [
  { id: "foryou", label: "Pour vous", icon: Heart, color: "text-red-500" },
  { id: "inspirations", label: "Inspirations", icon: Lightbulb, color: "text-amber-500" },
  { id: "trending", label: "Tendances", icon: Flame, color: "text-orange-500" },
  { id: "top", label: "Top ventes", icon: Star, color: "text-yellow-500" },
  { id: "recent", label: "Recents", icon: Clock, color: "text-blue-500" },
];

interface ProductTabsProps {
  listings: ListingWithImages[];
}

const ProductTabs = ({ listings }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState("foryou");

  // Simulate different sorting/filtering based on tab
  const getFilteredListings = () => {
    switch (activeTab) {
      case "foryou":
        // Personalized - show random mix
        return [...listings].sort(() => Math.random() - 0.5);
      case "inspirations":
        // Show listings with images first
        return [...listings].filter(l => l.images.length > 0);
      case "trending":
        // Sort by view count (simulated)
        return [...listings].sort((a, b) => ((b as any).view_count || 0) - ((a as any).view_count || 0));
      case "top":
        // Sort by price high to low
        return [...listings].sort((a, b) => b.price - a.price);
      case "recent":
        // Sort by date
        return [...listings].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      default:
        return listings;
    }
  };

  const filteredListings = getFilteredListings().slice(0, 12);

  return (
    <section className="py-6">
      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                isActive
                  ? "bg-card shadow-md border-2 border-primary text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? tab.color : "text-current")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredListings.map((listing, i) => (
          <div
            key={listing.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>

      {/* Load more indicator */}
      {listings.length > 12 && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Faites defiler pour voir plus de produits
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductTabs;
