import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Phone, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

      {/* Menu items */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate("/mes-annonces")}
          className="w-full flex items-center justify-between p-4 bg-card rounded-lg border"
        >
          <span className="font-medium text-foreground">Mes annonces</span>
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
