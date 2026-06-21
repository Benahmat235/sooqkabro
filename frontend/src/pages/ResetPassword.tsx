import { getErrorMessage } from "@/lib/supabaseErrors";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import AuthBlobs from "@/components/auth/AuthBlobs";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setReady(true);
  }, []);

  const handleReset = async () => {
    if (password.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Succès", description: "Mot de passe mis à jour" });
      navigate("/");
    } catch (err: unknown) {
      toast({ title: "Erreur", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pillInput =
    "h-14 rounded-full bg-muted border-0 px-6 text-base focus-visible:ring-2 focus-visible:ring-primary/40";

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <p className="text-muted-foreground">Lien invalide ou expiré.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <AuthBlobs variant="top" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-primary border-4 border-card shadow-warm flex items-center justify-center">
          <KeyRound className="h-12 w-12 text-primary-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-foreground text-center">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-base text-muted-foreground text-center max-w-xs">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>

        <div className="mt-10 w-full space-y-3">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className={`${pillInput} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className={pillInput}
          />
        </div>

        <div className="mt-auto w-full pt-8 space-y-4">
          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full h-14 rounded-full text-base font-bold shadow-warm"
          >
            {loading ? "Mise à jour..." : "Enregistrer"}
          </Button>
          <button
            onClick={() => navigate("/auth")}
            className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
