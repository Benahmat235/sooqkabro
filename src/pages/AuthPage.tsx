import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("+235");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendOtp = async () => {
    if (phone.length < 10) {
      toast({ title: "Erreur", description: "Numéro de téléphone invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-otp", {
        body: { action: "send", phone },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({ title: "Code envoyé", description: "Vérifiez votre WhatsApp" });
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
        body: { action: "verify", phone, code: otp, display_name: displayName },
      });
      if (error) throw error;
      if (!data.success) {
        toast({ title: "Erreur", description: data.message || "Code invalide", variant: "destructive" });
        return;
      }

      // If we got a session token, sign in the user
      if (data.session?.token?.properties?.hashed_token) {
        const verifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/verify?token=${data.session.token.properties.hashed_token}&type=magiclink`;
        const res = await fetch(verifyUrl, { method: "GET", redirect: "manual" });
        // Extract session from redirect or just reload
      }

      // Check if user has a display name
      if (!data.session?.user?.user_metadata?.display_name) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => step === "phone" ? navigate(-1) : setStep("phone")}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {step === "phone" && "Connexion"}
          {step === "otp" && "Vérification"}
          {step === "name" && "Votre profil"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {step === "phone" && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Entrez votre numéro</h2>
              <p className="text-sm text-muted-foreground">
                Un code de vérification sera envoyé sur votre WhatsApp
              </p>
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+235 XX XX XX XX"
              className="text-center text-lg h-12 max-w-xs"
            />
            <Button onClick={sendOtp} disabled={loading} className="w-full max-w-xs h-12 text-base">
              {loading ? "Envoi..." : "Recevoir le code"}
            </Button>
          </>
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
            <button onClick={sendOtp} className="text-sm text-primary font-medium">
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
