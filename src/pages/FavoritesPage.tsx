import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favoriteIds, isLoading: favsLoading } = useFavorites();
  const { data: allListings = [], isLoading: listingsLoading } = useListings();

  const loading = favsLoading || listingsLoading;
  const favoriteListings = allListings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link to="/">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Mes favoris</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !user ? (
          <div className="text-center py-12 space-y-4">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Connectez-vous pour sauvegarder vos favoris</p>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        ) : favoriteListings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Aucun favori pour le moment</p>
            <Button asChild variant="outline">
              <Link to="/">Parcourir les annonces</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
