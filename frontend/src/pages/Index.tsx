import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import PublishCTA from "@/components/PublishCTA";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { categories } from "@/data/categories";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import type { ListingWithImages } from "@/hooks/useListings";
import { containerVariants, itemVariants, fadeInUpVariants } from "@/lib/animations";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const { detectedCity } = useGeoLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (detectedCity && selectedCity === "all") {
      setSelectedCity(detectedCity);
    }
  }, [detectedCity]);
  const { user } = useAuth();

  const { data: listings = [], isLoading } = useListings(selectedCity);

  const isLoggedIn = !!user;

  const listingsByCategory = categories.reduce<Record<string, ListingWithImages[]>>((acc, cat) => {
    acc[cat.id] = listings.filter((l) => l.category_id === cat.id).slice(0, 6);
    return acc;
  }, {});

  const popularCategories = categories.filter((cat) => (listingsByCategory[cat.id]?.length || 0) > 0).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-3">
        {/* Category Grid with animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CategoryGrid />
        </motion.div>

        {/* Publish CTA with animation */}
        <motion.div 
          className="py-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PublishCTA />
        </motion.div>

        {isLoading ? (
          <section className="py-3">
            <Skeleton className="h-5 w-32 mb-3" />
            <motion.div 
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div key={`skeleton-${i}`} variants={itemVariants} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-square w-full skeleton-shimmer" />
                  <div className="p-1.5 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
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
                className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {listings.slice(0, 9).map((listing) => (
                  <motion.div key={listing.id} variants={itemVariants}>
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            {/* Category sections */}
            {popularCategories.map((cat, categoryIndex) => {
              const catListings = listingsByCategory[cat.id];
              if (!catListings || catListings.length === 0) return null;
              const Icon = cat.icon;
              
              return (
                <motion.section 
                  key={cat.id} 
                  className="py-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="p-1.5 rounded-lg bg-accent shadow-sm"
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="h-4 w-4 text-accent-foreground" />
                      </motion.div>
                      <h2 className="text-sm font-extrabold text-foreground">
                        {t(`cat.${cat.id}`).split(" ")[0]}
                      </h2>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground"
                      >
                        <TrendingUp className="h-2.5 w-2.5" />
                        <span>{catListings.length}</span>
                      </motion.div>
                    </div>
                    <Link 
                      to={`/categorie/${cat.id}`} 
                      className="group text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      {t("listings.seeMore")} 
                      <motion.div
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </motion.div>
                    </Link>
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    {catListings.map((listing) => (
                      <motion.div key={listing.id} variants={itemVariants}>
                        <ListingCard listing={listing} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              );
            })}
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
