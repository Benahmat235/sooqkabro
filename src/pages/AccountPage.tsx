import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut, Phone, ChevronRight, Eye, FileText, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Stats {
  totalListings: number;
  totalViews: number;
  totalFavorites: number;
}

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalListings: 0, totalViews: 0, totalFavorites: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      // Count listings
      const { count: listingCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get user's listing ids for views/favs count
      const { data: userListings } = await supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id);

      const ids = (userListings || []).map((l: any) => l.id);

      let totalViews = 0;
      let totalFavorites = 0;

      if (ids.length > 0) {
        const { count: viewCount } = await supabase
          .from("listing_views")
          .select("id", { count: "exact", head: true })
          .in("listing_id", ids);

        const { count: favCount } = await supabase
          .from("favorites")
          .select("id", { count: "exact", head: true })
          .in("listing_id", ids);

        totalViews = viewCount || 0;
        totalFavorites = favCount || 0;
      }

      setStats({
        totalListings: listingCount || 0,
        totalViews,
        totalFavorites,
      });
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Connectez-vous</h2>
            <p className="text-sm text-muted-foreground">
              Pour publier des annonces et gérer votre compte
            </p>
          </div>
          <Button onClick={() => navigate("/auth")} className="w-full max-w-xs h-12 text-base">
            Se connecter
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile header */}
      <div className="bg-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {user.user_metadata?.display_name || "Utilisateur"}
            </h2>
            <p className="text-sm opacity-80 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {user.phone || user.user_metadata?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-card border rounded-xl p-3 text-center">
          <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.totalListings}</p>
          <p className="text-[11px] text-muted-foreground">Annonces</p>
        </div>
        <div className="bg-card border rounded-xl p-3 text-center">
          <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.totalViews}</p>
          <p className="text-[11px] text-muted-foreground">Vues</p>
        </div>
        <div className="bg-card border rounded-xl p-3 text-center">
          <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.totalFavorites}</p>
          <p className="text-[11px] text-muted-foreground">Favoris</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={() => navigate("/mes-annonces")}
          className="w-full flex items-center justify-between p-4 bg-card rounded-lg border"
        >
          <span className="font-medium text-foreground">Mes annonces</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/favoris")}
          className="w-full flex items-center justify-between p-4 bg-card rounded-lg border"
        >
          <span className="font-medium text-foreground">Mes favoris</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Déconnexion
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
