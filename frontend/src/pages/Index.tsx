import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import NotificationCenter from "@/components/NotificationCenter";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { categories } from "@/data/categories";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import type { ListingWithImages } from "@/hooks/useListings";
import { containerVariants, itemVariants, fadeInUpVariants } from "@/lib/animations";
import { usePriceStatsBatch } from "@/hooks/usePriceStats";
import { classifyPrice } from "@/lib/pricing";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";


const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const navigate = useNavigate();
  const { detectedCity } = useGeoLocation();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);


  useEffect(() => {
    if (detectedCity && selectedCity === "all") {
      setSelectedCity(detectedCity);
    }
  }, [detectedCity]);

  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { data: listings = [], isLoading } = useListings(selectedCity);

  const { data: priceStatsMap } = usePriceStatsBatch(
    listings.map((l) => ({ category_id: l.category_id, subcategory_id: l.subcategory_id }))
  );
  const levelFor = (l: ListingWithImages) =>
    classifyPrice(l.price, priceStatsMap?.get(`${l.category_id}::${l.subcategory_id ?? ""}`));

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}&city=${selectedCity}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} hideSearch={true} />

      <main className="container mx-auto px-3 space-y-6">
        <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        {/* Hero Section */}
        <motion.section
          className="pt-8 pb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Find exactly what you need
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            The best local marketplace to buy and sell items quickly and safely.
          </p>
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What are you looking for?"
              value={heroSearchQuery}
              onChange={(e) => setHeroSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-14 rounded-full text-base shadow-sm border-border bg-card focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <button
              type="submit"
              className="absolute right-2 h-10 px-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        </motion.section>

        {/* Category Grid with animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CategoryGrid />
        </motion.div>

        {isLoading ? (
          <section className="py-3">
            <Skeleton className="h-5 w-32 mb-3" />
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div key={`skeleton-${i}`} variants={itemVariants} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full skeleton-shimmer" />
                  <div className="p-2 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        ) : listings.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <span className="text-3xl">📦</span>
            </motion.div>
            <p className="text-base font-bold text-foreground">{t("listings.none")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("listings.beFirst")}</p>
          </motion.div>
        ) : (
          <>
            {/* Main listings section */}
            <motion.section 
              className="py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center justify-between mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="p-1.5 rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoggedIn ? (
                      <Sparkles className="h-4 w-4 text-accent-foreground" />
                    ) : (
                      <Clock className="h-4 w-4 text-accent-foreground" />
                    )}
                  </motion.div>
                  <h2 className="text-sm font-extrabold text-foreground">
                    {isLoggedIn ? t("listings.forYou") : t("listings.recent")}
                  </h2>
                  {isLoggedIn && (
                    <motion.span
                      className="text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Personnalisé
                    </motion.span>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {listings.slice(0, 9).map((listing) => (
                  <motion.div key={listing.id} variants={itemVariants}>
                    <ListingCard listing={listing} priceLevel={levelFor(listing)} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
