import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Eye, EyeOff, KeyRound, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";

type AuthView = "login" | "register" | "forgot";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: t("auth.error"), description: t("auth.googleFailed"), variant: "destructive" });
      }
      if (result.redirected) return;
      toast({ title: t("auth.welcomeMsg"), description: t("auth.loginSuccess") });
      navigate("/");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || t("auth.loginFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: t("auth.error"), description: t("auth.appleFailed"), variant: "destructive" });
      }
      if (result.redirected) return;
      toast({ title: t("auth.welcomeMsg"), description: t("auth.loginSuccess") });
      navigate("/");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || t("auth.loginFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: t("auth.error"), description: t("auth.fillFields"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast({ title: t("auth.welcomeMsg"), description: t("auth.loginSuccess") });
      navigate("/");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || t("auth.loginFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: t("auth.error"), description: t("auth.fillFields"), variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t("auth.error"), description: t("auth.passwordLength"), variant: "destructive" });
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
      toast({ title: t("auth.accountCreated"), description: t("auth.checkEmail") });
      setView("login");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || t("auth.loginFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: t("auth.error"), description: t("auth.fillFields"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: t("auth.emailSent"), description: t("auth.checkInbox") });
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || t("auth.loginFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view !== "login") setView("login");
    else navigate(-1);
  };

  const headerTitle: Record<AuthView, string> = {
    login: t("auth.login"),
    register: t("auth.register"),
    forgot: t("auth.forgot"),
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
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

        {view === "login" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <User className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">{t("auth.welcome")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
            </div>

            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <GoogleIcon /> {t("auth.continueGoogle")}
            </Button>
            <Button onClick={handleAppleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <AppleIcon /> {t("auth.continueApple")}
            </Button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">{t("auth.or")}</span>
              <div className="flex-1 border-t" />
            </div>

            <div className="w-full space-y-3">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email")} type="email" className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary/30" />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password")} className="h-12 rounded-xl bg-muted/50 border-0 pr-12 focus-visible:ring-primary/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleEmailLogin} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />{t("auth.logging")}</span> : t("auth.loginBtn")}
            </Button>

            <div className="flex flex-col items-center gap-3 w-full">
              <button onClick={() => { setView("forgot"); setEmail(""); }} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> {t("auth.forgotLink")}
              </button>
              <div className="w-full border-t" />
              <button onClick={() => setView("register")} className="text-sm text-muted-foreground">
                {t("auth.noAccount")} <span className="text-primary font-bold">{t("auth.signupLink")}</span>
              </button>
            </div>
          </div>
        )}

        {view === "register" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <Mail className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">{t("auth.createAccount")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.createSubtitle")}</p>
            </div>

            <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <GoogleIcon /> {t("auth.registerGoogle")}
            </Button>
            <Button onClick={handleAppleLogin} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-bold gap-3">
              <AppleIcon /> {t("auth.registerApple")}
            </Button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">{t("auth.orEmail")}</span>
              <div className="flex-1 border-t" />
            </div>

            <div className="w-full space-y-3">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("auth.displayName")} className="h-12 rounded-xl bg-muted/50 border-0" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email")} type="email" className="h-12 rounded-xl bg-muted/50 border-0" />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordMin")} className="h-12 rounded-xl bg-muted/50 border-0 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleEmailRegister} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? t("auth.registering") : t("auth.registerBtn")}
            </Button>

            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              {t("auth.hasAccount")} <span className="text-primary font-bold">{t("auth.loginLink")}</span>
            </button>
          </div>
        )}

        {view === "forgot" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
              <KeyRound className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">{t("auth.resetTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.resetSubtitle")}</p>
            </div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email")} type="email" className="h-12 rounded-xl bg-muted/50 border-0 w-full" />
            <Button onClick={handleForgotPassword} disabled={loading} className="w-full h-12 text-base rounded-xl font-bold">
              {loading ? t("auth.sending") : t("auth.sendLink")}
            </Button>
            <button onClick={() => setView("login")} className="text-sm text-muted-foreground">
              {t("auth.backToLogin")} <span className="text-primary font-bold">{t("auth.loginLink")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
