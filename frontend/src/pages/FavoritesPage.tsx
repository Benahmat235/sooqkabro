import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favoriteIds, isLoading: favsLoading } = useFavorites();
  const { data: allListings = [], isLoading: listingsLoading } = useListings();

  const loading = favsLoading || listingsLoading;
  const favoriteListings = allListings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass border-b px-4 py-3 flex items-center gap-3">
        <Link to="/">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-extrabold text-foreground">Mes favoris</h1>
        {favoriteListings.length > 0 && (
          <span className="ml-auto text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {favoriteListings.length}
          </span>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`fav-skeleton-${i}`} className="rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-2.5 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-9 w-9 text-accent-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">Sauvegardez vos favoris</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">
              Connectez-vous pour sauvegarder les annonces qui vous intéressent
            </p>
            <Button asChild size="lg" className="rounded-xl px-8">
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        ) : favoriteListings.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">Pas encore de favoris</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Explorez les annonces et ajoutez-les à vos favoris
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-8">
              <Link to="/">Parcourir les annonces</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteListings.map((l, i) => (
              <div
                key={l.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
