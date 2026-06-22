import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";
import { getCityById } from "@/data/cities";
import type { ListingWithImages } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";

function optimizeImage(url: string, width: number): string {
  if (!url) return url;
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
  }
  return url;
}

interface Props {
  listings: ListingWithImages[];
  isLoading?: boolean;
}

const FeaturedCarousel = ({ listings, isLoading }: Props) => {
  // Pick the best 6 candidates: with an image, recent, prioritize badged/discount
  const items = (listings || [])
    .filter((l) => l.images && l.images.length > 0)
    .slice()
    .sort((a, b) => {
      const sa = (a.badge ? 2 : 0) + (a.original_price && a.original_price > a.price ? 1 : 0);
      const sb = (b.badge ? 2 : 0) + (b.original_price && b.original_price > b.price ? 1 : 0);
      if (sb !== sa) return sb - sa;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 6);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    // no-op — autoplay manages itself
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="py-3">
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }
  if (items.length < 2) return null;

  return (
    <section className="pt-3 pb-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[hsl(var(--chad-yellow))] to-amber-400 shadow-sm">
          <Sparkles className="h-4 w-4 text-foreground" />
        </div>
        <h2 className="text-sm font-extrabold text-foreground">À la une</h2>
        <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          Sélection
        </span>
      </div>

      <div ref={emblaRef} className="overflow-hidden -mx-3 px-3">
        <div className="flex gap-3">
          {items.map((l) => {
            const city = getCityById(l.city_id);
            const img = optimizeImage(l.images[0], 640);
            const hasDiscount = l.original_price && l.original_price > l.price;
            const discountPercent = hasDiscount
              ? Math.round(((l.original_price! - l.price) / l.original_price!) * 100)
              : 0;
            return (
              <Link
                key={l.id}
                to={`/annonce/${l.id}`}
                className="relative shrink-0 basis-[88%] sm:basis-[60%] md:basis-[45%] lg:basis-[32%] rounded-2xl overflow-hidden bg-card shadow-card group"
                aria-label={`${l.title} - ${formatPrice(l.price)}`}
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <motion.img
                    src={img}
                    alt={l.title}
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="bg-gradient-to-r from-[hsl(var(--chad-yellow))] to-amber-400 text-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                      À la une
                    </span>
                    {hasDiscount && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                    <h3 className="font-extrabold text-sm line-clamp-1 drop-shadow">
                      {l.title}
                    </h3>
                    <div className={cn("flex items-baseline gap-1.5 mt-0.5")}>
                      <span className="text-base font-black drop-shadow">
                        {formatPrice(l.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] line-through opacity-70">
                          {formatPrice(l.original_price!)}
                        </span>
                      )}
                    </div>
                    {city && (
                      <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate">{city.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
