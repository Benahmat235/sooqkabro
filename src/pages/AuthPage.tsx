import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail, Phone, Eye, EyeOff, KeyRound, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "register" | "forgot" | "phone" | "phone-otp";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("+235");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "Erreur", description: "Échec de la connexion Google", variant: "destructive" });
      }
      if (result.redirected) return;
      toast({ title: "Bienvenue !", description: "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de connexion", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast({ title: "Bienvenue !", description: "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de connexion", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName.trim() || undefined },
        },
      });
      if (error) throw error;
      toast({ title: "Compte créé !", description: "Vérifiez votre e-mail pour confirmer votre inscription." });
      setView("login");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Inscription échouée", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtp = async () => {
    if (phone.length < 10) {
      toast({ title: "Erreur", description: "Numéro de téléphone invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast({ title: "Code envoyé", description: "Vérifiez vos SMS" });
      setView("phone-otp");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'envoyer le code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      toast({ title: "Bienvenue !", description: "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Code invalide", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: "Erreur", description: "Entrez votre adresse e-mail", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "E-mail envoyé", description: "Consultez votre boîte de réception pour réinitialiser votre mot de passe." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de l'envoi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === "phone-otp") { setView("phone"); setOtp(""); }
    else if (view !== "login") setView("login");
    else navigate(-1);
  };

  const headerTitle: Record<AuthView, string> = {
    login: "Connexion",
    register: "Inscription",
    forgot: "Mot de passe oublié",
    phone: "Connexion par téléphone",
    "phone-otp": "Vérification SMS",
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b glass">
        <button onClick={goBack} className="p-1 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{headerTitle[view]}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* ─── LOGIN ─── */}
        {view === "login" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <User className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">Bon retour !</h2>
              <p className="text-sm text-muted-foreground">Connectez-vous à votre compte</p>
            </div>

            {/* Google */}
            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <GoogleIcon /> Continuer avec Google
            </Button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 border-t" />
            </div>

            {/* Email/Password */}
            <div className="w-full space-y-3">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" type="email" className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary/30" />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="h-12 rounded-xl bg-muted/50 border-0 pr-12 focus-visible:ring-primary/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleEmailLogin} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Connexion...</span> : "Se connecter"}
            </Button>

            {/* Phone login */}
            <Button onClick={() => setView("phone")} variant="ghost" className="w-full h-11 rounded-xl text-sm font-semibold gap-2">
              <Phone className="h-4 w-4" /> Se connecter par téléphone
            </Button>

            <div className="flex flex-col items-center gap-3 w-full">
              <button onClick={() => { setView("forgot"); setEmail(""); }} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Mot de passe oublié ?
              </button>
              <div className="w-full border-t" />
              <button onClick={() => setView("register")} className="text-sm text-muted-foreground">
                Pas encore de compte ? <span className="text-primary font-bold">S'inscrire</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── REGISTER ─── */}
        {view === "register" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <Mail className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">Créer un compte</h2>
              <p className="text-sm text-muted-foreground">Inscrivez-vous gratuitement</p>
            </div>

            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <GoogleIcon /> S'inscrire avec Google
            </Button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">ou par e-mail</span>
              <div className="flex-1 border-t" />
            </div>

            <div className="w-full space-y-3">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nom affiché (optionnel)" className="h-12 rounded-xl bg-muted/50 border-0" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" type="email" className="h-12 rounded-xl bg-muted/50 border-0" />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (min. 6 caractères)" className="h-12 rounded-xl bg-muted/50 border-0 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleEmailRegister} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>

            <Button onClick={() => setView("phone")} variant="ghost" className="w-full h-11 rounded-xl text-sm font-semibold gap-2">
              <Phone className="h-4 w-4" /> S'inscrire par téléphone
            </Button>

            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              Déjà un compte ? <span className="text-primary font-bold">Se connecter</span>
            </button>
          </div>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {view === "forgot" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <KeyRound className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">Réinitialiser</h2>
              <p className="text-sm text-muted-foreground">Un lien sera envoyé à votre adresse e-mail</p>
            </div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" type="email" className="h-12 rounded-xl bg-muted/50 border-0 w-full" />
            <Button onClick={handleForgotPassword} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>
            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              Retour à la <span className="text-primary font-bold">connexion</span>
            </button>
          </div>
        )}

        {/* ─── PHONE LOGIN ─── */}
        {view === "phone" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <Phone className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">Connexion par téléphone</h2>
              <p className="text-sm text-muted-foreground">Un code SMS vous sera envoyé</p>
            </div>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+235 XX XX XX XX" className="text-center text-lg h-12 rounded-xl bg-muted/50 border-0 w-full" />
            <Button onClick={handlePhoneOtp} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? "Envoi..." : "Envoyer le code SMS"}
            </Button>
            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              Retour à la <span className="text-primary font-bold">connexion</span>
            </button>
          </div>
        )}

        {/* ─── PHONE OTP ─── */}
        {view === "phone-otp" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-foreground">Code de vérification</h2>
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres envoyé par SMS au<br />
                <span className="font-bold text-foreground">{phone}</span>
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
            <Button onClick={verifyPhoneOtp} disabled={loading || otp.length !== 6} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
