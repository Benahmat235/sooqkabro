import { getErrorMessage } from "@/lib/supabaseErrors";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, EyeOff, Camera, Check, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAppToast } from "@/hooks/useAppToast";
import { useTranslation } from "@/i18n/useTranslation";
import { validatePassword, checkRateLimit, sanitizeInput } from "@/lib/security";
import AuthBlobs from "@/components/auth/AuthBlobs";

type AuthView = "login-email" | "login-password" | "register" | "forgot";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login-email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useAppToast();
  const { t } = useTranslation();

  const passwordStrength = validatePassword(password);

  // ------------ handlers ------------
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) showError(t("auth.googleFailed"), t("auth.error"));
      if (result.redirected) return;
      success(t("auth.welcomeMsg"), t("auth.loginSuccess"));
      navigate("/");
    } catch (err: unknown) {
      showError(err);
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
      if (result.error) showError(t("auth.appleFailed"), t("auth.error"));
      if (result.redirected) return;
      success(t("auth.welcomeMsg"), t("auth.loginSuccess"));
      navigate("/");
    } catch (err: unknown) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPasswordStep = () => {
    const trimmed = email.trim();
    if (!trimmed || !/.+@.+\..+/.test(trimmed)) {
      showError("Adresse e-mail invalide", t("auth.error"));
      return;
    }
    setView("login-password");
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError(t("auth.fillFields"), t("auth.error"));
      return;
    }
    const rateLimit = checkRateLimit(`login_${email.trim()}`, 5, 60000);
    if (!rateLimit.allowed) {
      const seconds = Math.ceil((rateLimit.remainingTime || 60000) / 1000);
      showError(`Réessayez dans ${seconds} secondes`, "Trop de tentatives");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email.trim()),
        password,
      });
      if (error) throw error;
      success(t("auth.loginSuccess"), t("auth.welcomeMsg"));
      navigate("/");
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("auth.loginFailed")), t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email.trim() || !password.trim()) {
      showError(t("auth.fillFields"), t("auth.error"));
      return;
    }
    if (passwordStrength.score < 3) {
      showError(passwordStrength.suggestions[0] || "Choisissez un mot de passe plus fort", "Mot de passe trop faible");
      return;
    }
    setLoading(true);
    try {
      const phoneClean = phone.replace(/\D/g, "");
      const fullPhone = phoneClean ? `+235${phoneClean}` : "";
      const { error } = await supabase.auth.signUp({
        email: sanitizeInput(email.trim()),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: sanitizeInput(displayName.trim()) || undefined,
            phone: fullPhone || undefined,
          },
        },
      });
      if (error) throw error;
      success(t("auth.checkEmail"), t("auth.accountCreated"));
      setView("login-email");
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("auth.loginFailed")), t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showError(t("auth.fillFields"), t("auth.error"));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      success(t("auth.checkInbox"), t("auth.emailSent"));
    } catch (err: unknown) {
      showError(getErrorMessage(err, t("auth.loginFailed")), t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError("Image trop volumineuse (max 5 MB)", t("auth.error"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const cancel = () => navigate(-1);

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

  // Common pill input classes
  const pillInput =
    "h-14 rounded-full bg-muted border-0 px-6 text-base focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground";
  const pillBtn = "w-full h-14 rounded-full text-base font-bold shadow-warm";
  const cancelLink =
    "block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors mt-4";

  // ============== VIEWS ==============

  // -------- LOGIN STEP 1 : email --------
  if (view === "login-email") {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
        <AuthBlobs variant="top" />

        <div className="relative z-10 flex-1 flex flex-col px-6 pt-8 pb-8 max-w-md mx-auto w-full">
          <div className="flex-1 flex flex-col justify-end">
            <h1 className="text-6xl font-extrabold text-foreground tracking-tight leading-none">
              Connexion
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Bon retour parmi nous ! <span aria-hidden>❤</span>
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 rounded-full font-bold gap-3"
            >
              <GoogleIcon /> {t("auth.continueGoogle")}
            </Button>
            <Button
              onClick={handleAppleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 rounded-full font-bold gap-3"
            >
              <AppleIcon /> {t("auth.continueApple")}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">{t("auth.or")}</span>
              <div className="flex-1 border-t" />
            </div>

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              type="email"
              autoComplete="email"
              className={pillInput}
            />
          </div>

          <div className="mt-6">
            <Button onClick={goToPasswordStep} disabled={loading} className={pillBtn}>
              Suivant
            </Button>
            <button onClick={cancel} className={cancelLink}>
              Annuler
            </button>
            <button
              onClick={() => setView("register")}
              className="block mx-auto text-sm text-muted-foreground mt-3"
            >
              {t("auth.noAccount")}{" "}
              <span className="text-primary font-bold">{t("auth.signupLink")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------- LOGIN STEP 2 : password --------
  if (view === "login-password") {
    const initials = email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
        <AuthBlobs variant="top" />

        <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-8 max-w-md mx-auto w-full">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-primary border-4 border-card shadow-warm flex items-center justify-center">
              <span className="text-3xl font-extrabold text-primary-foreground">{initials}</span>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-foreground text-center">
            Bonjour !
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">{email}</p>

          <div className="mt-10 w-full space-y-4">
            <p className="text-center text-base text-foreground/80">Saisissez votre mot de passe</p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                autoFocus
                className={`${pillInput} pr-14`}
                onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              onClick={() => setView("forgot")}
              className="block mx-auto text-sm text-primary font-semibold hover:underline"
            >
              {t("auth.forgotLink")}
            </button>
          </div>

          <div className="mt-auto w-full pt-8 space-y-4">
            <Button onClick={handleEmailLogin} disabled={loading} className={pillBtn}>
              {loading ? t("auth.logging") : t("auth.loginBtn")}
            </Button>
            <button
              onClick={() => {
                setPassword("");
                setView("login-email");
              }}
              className="flex items-center justify-center gap-3 mx-auto text-sm text-muted-foreground"
            >
              Ce n'est pas vous ?
              <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------- REGISTER --------
  if (view === "register") {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
        <AuthBlobs variant="top" />

        <div className="relative z-10 flex-1 flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto w-full">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight leading-none">
            Créer un<br />compte
          </h1>

          {/* Photo upload */}
          <div className="mt-8 flex justify-center">
            <label className="relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              <div
                className={`w-28 h-28 rounded-full border-2 border-dashed border-primary flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 ${
                  photoPreview ? "border-solid" : ""
                }`}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-9 w-9 text-primary" />
                )}
              </div>
            </label>
          </div>

          <div className="mt-8 space-y-3">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("auth.displayName")}
              className={pillInput}
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              type="email"
              autoComplete="email"
              className={pillInput}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                className={`${pillInput} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Phone with Chad flag */}
            <div className={`${pillInput} flex items-center gap-3 px-6`}>
              <span className="text-xl" aria-hidden>🇹🇩</span>
              <span className="text-sm font-semibold text-foreground">+235</span>
              <span className="text-muted-foreground">|</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Votre numéro"
                className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground"
              />
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <div className="flex gap-1 px-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < passwordStrength.score
                        ? passwordStrength.score >= 3
                          ? "bg-success"
                          : "bg-secondary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-8 space-y-4">
            <Button
              onClick={handleEmailRegister}
              disabled={loading || passwordStrength.score < 3}
              className={pillBtn}
            >
              {loading ? t("auth.registering") : "Terminé"}
            </Button>
            <button onClick={() => setView("login-email")} className={cancelLink}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------- FORGOT PASSWORD --------
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <AuthBlobs variant="top" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-primary border-4 border-card shadow-warm flex items-center justify-center">
          <Mail className="h-12 w-12 text-primary-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-foreground text-center">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-base text-muted-foreground text-center max-w-xs">
          Saisissez votre e-mail, nous vous enverrons un lien de réinitialisation.
        </p>

        {/* Method card (email-only, selected) */}
        <div className="mt-10 w-full">
          <div className="flex items-center justify-between rounded-full bg-accent px-6 py-4">
            <span className="font-bold text-primary">E-mail</span>
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Check className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-6 w-full">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            type="email"
            className={pillInput}
          />
        </div>

        <div className="mt-auto w-full pt-8 space-y-4">
          <Button onClick={handleForgotPassword} disabled={loading} className={pillBtn}>
            {loading ? t("auth.sending") : "Envoyer"}
          </Button>
          <button onClick={() => setView("login-email")} className={cancelLink}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
