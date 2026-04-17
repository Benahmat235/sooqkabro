import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Flame, TrendingUp, Clock, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/useListings";
import { usePersonalizedFeed } from "@/hooks/usePersonalizedFeed";
import { useTranslation } from "@/i18n/useTranslation";
import { categories } from "@/data/categories";
import type { ListingWithImages } from "@/hooks/useListings";

const HorizontalScroll = ({
  title,
  icon: Icon,
  listings,
  color,
}: {
  title: string;
  icon: React.ElementType;
  listings: ListingWithImages[];
  color: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  if (!listings.length) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <h2 className="text-base font-bold text-foreground">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">{listings.length}</span>
      </div>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2 no-scrollbar"
      >
        {listings.map((l) => (
          <div key={l.id} className="min-w-[160px] max-w-[180px] snap-start shrink-0">
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturedCard = ({ listing }: { listing: ListingWithImages }) => {
  const cat = categories.find((c) => c.id === listing.category_id);
  return (
    <Link
      to={`/annonce/${listing.id}`}
      className="relative min-w-[280px] h-[200px] rounded-2xl overflow-hidden shrink-0 snap-start group"
    >
      <img
        src={listing.images[0] || "/placeholder.svg"}
        alt={listing.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-4">
        {listing.badge && (
          <span className="inline-block text-[10px] font-extrabold uppercase bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full mb-2">
            {listing.badge}
          </span>
        )}
        <h3 className="text-card text-sm font-bold line-clamp-2 drop-shadow-sm">
          {listing.title}
        </h3>
        <p className="text-card/80 text-xs font-semibold mt-1">
          {listing.price.toLocaleString()} FCFA
        </p>
      </div>
    </Link>
  );
};

const CategoryCollection = ({
  title,
  categoryId,
  listings,
}: {
  title: string;
  categoryId: string;
  listings: ListingWithImages[];
}) => {
  const filtered = listings.filter((l) => l.category_id === categoryId).slice(0, 10);
  if (!filtered.length) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <Link
          to={`/categorie/${categoryId}`}
          className="text-xs text-primary font-medium flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2 no-scrollbar">
        {filtered.map((l) => (
          <div key={l.id} className="min-w-[160px] max-w-[180px] snap-start shrink-0">
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  );
};

const SkeletonSection = () => (
  <div className="mb-6 px-4">
    <Skeleton className="h-5 w-40 mb-3" />
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="min-w-[160px] h-[220px] rounded-2xl shrink-0" />
      ))}
    </div>
  </div>
);

const DiscoverPage = () => {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState("all");
  const { data: listings, isLoading } = useListings(selectedCity);
  const { data: personalizedFeed } = usePersonalizedFeed(selectedCity);

  const featured = (listings || []).filter(
    (l) => l.badge === "premium" || l.badge === "urgent"
  );
  const deals = (listings || [])
    .filter((l) => (l as any).original_price && (l as any).original_price > l.price)
    .slice(0, 12);
  const recent = (listings || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);
  const popular = (listings || [])
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 12);
  const forYou = personalizedFeed?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <div className="pt-4">
        <h1 className="text-xl font-extrabold text-foreground px-4 mb-4">
          {t("discover.title")}
        </h1>

        {isLoading ? (
          <>
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </>
        ) : (
          <>
            {/* Featured carousel */}
            {featured.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 px-4 mb-3">
                  <Flame className="h-5 w-5 text-destructive" />
                  <h2 className="text-base font-bold text-foreground">
                    {t("discover.featured")}
                  </h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2 no-scrollbar">
                  {featured.map((l) => (
                    <FeaturedCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}

            {/* Personalized */}
            {forYou.length > 0 && (
              <HorizontalScroll
                title={t("discover.forYou")}
                icon={Sparkles}
                listings={forYou}
                color="text-primary"
              />
            )}

            {/* Deals */}
            <HorizontalScroll
              title={t("discover.deals")}
              icon={TrendingUp}
              listings={deals}
              color="text-green-500"
            />

            {/* Recent */}
            <HorizontalScroll
              title={t("discover.recent")}
              icon={Clock}
              listings={recent}
              color="text-muted-foreground"
            />

            {/* Popular */}
            <HorizontalScroll
              title={t("discover.popular")}
              icon={TrendingUp}
              listings={popular}
              color="text-orange-500"
            />

            {/* Category collections */}
            <CategoryCollection
              title={t("cat.vehicules")}
              categoryId="vehicules"
              listings={listings || []}
            />
            <CategoryCollection
              title={t("cat.immobilier")}
              categoryId="immobilier"
              listings={listings || []}
            />
            <CategoryCollection
              title={t("cat.telephones")}
              categoryId="telephones"
              listings={listings || []}
            />
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DiscoverPage;
