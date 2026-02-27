import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMethod = "whatsapp" | "sms" | "username";
type Step = "input" | "otp" | "name";
type UsernameMode = "login" | "register";

const AuthPage = () => {
  const [method, setMethod] = useState<AuthMethod>("whatsapp");
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState("+235");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameMode, setUsernameMode] = useState<UsernameMode>("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendOtp = async (channel: "whatsapp" | "sms") => {
    if (phone.length < 10) {
      toast({ title: "Erreur", description: "Numéro de téléphone invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "send", phone, channel },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({ title: "Code envoyé", description: channel === "sms" ? "Vérifiez vos SMS" : "Vérifiez votre WhatsApp" });
      setStep("otp");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'envoyer le code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "verify", phone, code: otp },
      });
      if (error) throw error;
      if (!data.success) {
        toast({ title: "Erreur", description: data.message || "Code invalide", variant: "destructive" });
        return;
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      if (data.needsName) {
        setStep("name");
        return;
      }

      toast({ title: "Bienvenue !", description: "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Vérification échouée", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameAuth = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const action = usernameMode === "register" ? "register" : "login";
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { 
          action, 
          username: username.trim(), 
          password,
          display_name: displayName.trim() || username.trim(),
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

      toast({ title: "Bienvenue !", description: usernameMode === "register" ? "Compte créé" : "Connexion réussie" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de l'authentification", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
      }
      toast({ title: "Bienvenue !", description: "Profil enregistré" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step !== "input") {
      setStep("input");
      setOtp("");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={goBack}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {step === "input" && "Connexion"}
          {step === "otp" && "Vérification"}
          {step === "name" && "Votre profil"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {step === "input" && (
          <Tabs value={method} onValueChange={(v) => setMethod(v as AuthMethod)} className="w-full max-w-sm">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp" className="text-xs gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="sms" className="text-xs gap-1">
                <Phone className="h-3.5 w-3.5" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="username" className="text-xs gap-1">
                <User className="h-3.5 w-3.5" />
                Username
              </TabsTrigger>
            </TabsList>

            {/* WhatsApp OTP */}
            <TabsContent value="whatsapp" className="flex flex-col items-center gap-5 mt-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-foreground">Connexion WhatsApp</h2>
                <p className="text-sm text-muted-foreground">Code envoyé sur votre WhatsApp</p>
              </div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+235 XX XX XX XX"
                className="text-center text-lg h-12"
              />
              <Button onClick={() => sendOtp("whatsapp")} disabled={loading} className="w-full h-12 text-base">
                {loading ? "Envoi..." : "Recevoir le code"}
              </Button>
            </TabsContent>

            {/* SMS OTP */}
            <TabsContent value="sms" className="flex flex-col items-center gap-5 mt-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-foreground">Connexion par SMS</h2>
                <p className="text-sm text-muted-foreground">Code envoyé par SMS classique</p>
              </div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+235 XX XX XX XX"
                className="text-center text-lg h-12"
              />
              <Button onClick={() => sendOtp("sms")} disabled={loading} className="w-full h-12 text-base">
                {loading ? "Envoi..." : "Recevoir le code SMS"}
              </Button>
            </TabsContent>

            {/* Username + Password */}
            <TabsContent value="username" className="flex flex-col items-center gap-4 mt-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant={usernameMode === "login" ? "default" : "outline"}
                  onClick={() => setUsernameMode("login")}
                  className="flex-1"
                  size="sm"
                >
                  Connexion
                </Button>
                <Button
                  variant={usernameMode === "register" ? "default" : "outline"}
                  onClick={() => setUsernameMode("register")}
                  className="flex-1"
                  size="sm"
                >
                  Inscription
                </Button>
              </div>

              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                className="h-12"
              />
              {usernameMode === "register" && (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nom affiché (optionnel)"
                  className="h-12"
                />
              )}
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="h-12"
              />
              <Button onClick={handleUsernameAuth} disabled={loading} className="w-full h-12 text-base">
                {loading ? "Chargement..." : usernameMode === "register" ? "Créer un compte" : "Se connecter"}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {step === "otp" && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Code de vérification</h2>
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres envoyé au<br />
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
            <Button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full max-w-xs h-12 text-base">
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
            <button onClick={() => sendOtp(method as "whatsapp" | "sms")} className="text-sm text-primary font-medium">
              Renvoyer le code
            </button>
          </>
        )}

        {step === "name" && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Comment vous appelez-vous ?</h2>
              <p className="text-sm text-muted-foreground">Ce nom sera visible sur vos annonces</p>
            </div>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Votre nom"
              className="text-center text-lg h-12 max-w-xs"
            />
            <Button onClick={saveProfile} disabled={loading || !displayName.trim()} className="w-full max-w-xs h-12 text-base">
              {loading ? "Enregistrement..." : "Continuer"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
