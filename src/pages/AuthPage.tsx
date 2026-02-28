import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, MessageSquare, User, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "register" | "forgot" | "otp" | "name";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [phone, setPhone] = useState("+235");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ─── Login by username + password ───
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "login", username: username.trim(), password },
      });
      if (error) throw error;
      if (!data.success) {
        toast({ title: "Erreur", description: data.message, variant: "destructive" });
        return;
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      toast({ title: "Bienvenue !", description: "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de connexion", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Register: step 1 – send WhatsApp OTP ───
  const sendWhatsAppOtp = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Remplissez le nom d'utilisateur et le mot de passe", variant: "destructive" });
      return;
    }
    if (phone.length < 10) {
      toast({ title: "Erreur", description: "Numéro de téléphone invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "send", phone, channel: "whatsapp" },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      toast({ title: "Code envoyé", description: "Vérifiez votre WhatsApp" });
      setView("otp");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'envoyer le code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Register: step 2 – verify OTP then create account ───
  const verifyAndRegister = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      // Verify OTP first
      const { data: otpData, error: otpError } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "verify_only", phone, code: otp },
      });
      if (otpError) throw otpError;
      if (!otpData.success) {
        toast({ title: "Erreur", description: otpData.message || "Code invalide", variant: "destructive" });
        return;
      }

      // Now register the user
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: {
          action: "register",
          username: username.trim(),
          password,
          display_name: displayName.trim() || username.trim(),
          phone,
        },
      });
      if (error) throw error;
      if (!data.success) {
        toast({ title: "Erreur", description: data.message, variant: "destructive" });
        return;
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      toast({ title: "Bienvenue !", description: "Compte créé avec succès" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Inscription échouée", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot password: send OTP ───
  const sendForgotOtp = async () => {
    if (!username.trim() || phone.length < 10) {
      toast({ title: "Erreur", description: "Remplissez votre nom d'utilisateur et numéro de téléphone", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "send", phone, channel: "whatsapp" },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      toast({ title: "Code envoyé", description: "Vérifiez votre WhatsApp" });
      setView("otp");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'envoyer le code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot password: verify OTP + reset ───
  const verifyAndResetPassword = async () => {
    if (otp.length !== 6 || !password.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "reset_password", phone, code: otp, username: username.trim(), new_password: password },
      });
      if (error) throw error;
      if (!data.success) {
        toast({ title: "Erreur", description: data.message, variant: "destructive" });
        return;
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      toast({ title: "Mot de passe réinitialisé", description: "Vous êtes connecté" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Réinitialisation échouée", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === "otp") {
      setView(view === "otp" ? "register" : "login");
      setOtp("");
    } else if (view !== "login") {
      setView("login");
    } else {
      navigate(-1);
    }
  };

  const headerTitle = {
    login: "Connexion",
    register: "Inscription",
    forgot: "Mot de passe oublié",
    otp: "Vérification WhatsApp",
    name: "Votre profil",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={goBack}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{headerTitle[view]}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* ─── LOGIN ─── */}
        {view === "login" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Se connecter</h2>
              <p className="text-sm text-muted-foreground">Entrez vos identifiants</p>
            </div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              className="h-12"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="h-12"
            />
            <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base">
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
            <div className="flex flex-col items-center gap-2 w-full">
              <button onClick={() => { setView("forgot"); setOtp(""); setPassword(""); }} className="text-sm text-primary font-medium">
                <KeyRound className="inline h-3.5 w-3.5 mr-1" />
                Mot de passe oublié ?
              </button>
              <button onClick={() => { setView("register"); setOtp(""); }} className="text-sm text-muted-foreground">
                Pas encore de compte ? <span className="text-primary font-medium">S'inscrire</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── REGISTER ─── */}
        {view === "register" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Créer un compte</h2>
              <p className="text-sm text-muted-foreground">Vérification WhatsApp requise</p>
            </div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              className="h-12"
            />
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nom affiché (optionnel)"
              className="h-12"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="h-12"
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+235 XX XX XX XX"
              className="text-center text-lg h-12"
            />
            <Button onClick={sendWhatsAppOtp} disabled={loading} className="w-full h-12 text-base">
              {loading ? "Envoi..." : "Vérifier par WhatsApp"}
            </Button>
            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              Déjà un compte ? <span className="text-primary font-medium">Se connecter</span>
            </button>
          </div>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {view === "forgot" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Réinitialiser le mot de passe</h2>
              <p className="text-sm text-muted-foreground">Un code sera envoyé sur votre WhatsApp</p>
            </div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              className="h-12"
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+235 XX XX XX XX"
              className="text-center text-lg h-12"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="h-12"
            />
            <Button onClick={sendForgotOtp} disabled={loading} className="w-full h-12 text-base">
              {loading ? "Envoi..." : "Envoyer le code WhatsApp"}
            </Button>
            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              Retour à la <span className="text-primary font-medium">connexion</span>
            </button>
          </div>
        )}

        {/* ─── OTP VERIFICATION ─── */}
        {view === "otp" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Code de vérification</h2>
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres envoyé sur WhatsApp au<br />
                <span className="font-semibold text-foreground">{phone}</span>
              </p>
            </div>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {/* For forgot password, also show new password field */}
            {view === "otp" && password && (
              <p className="text-xs text-muted-foreground">Nouveau mot de passe déjà saisi ✓</p>
            )}

            <Button
              onClick={view === "otp" ? (password && username ? verifyAndResetPassword : verifyAndRegister) : verifyAndRegister}
              disabled={loading || otp.length !== 6}
              className="w-full h-12 text-base"
            >
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
