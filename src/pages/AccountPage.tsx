import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogOut, Phone, ChevronRight, Eye, FileText, Heart, Pencil, Check, X, Camera, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalListings: number;
  totalViews: number;
  totalFavorites: number;
}

interface Profile {
  display_name: string | null;
  phone: string;
  username: string | null;
  avatar_url: string | null;
}

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({ totalListings: 0, totalViews: 0, totalFavorites: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: "", phone: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("display_name, phone, username, avatar_url").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({
            display_name: data.display_name || "",
            phone: data.phone || "",
            username: data.username || "",
          });
        }
      });

    const fetchStats = async () => {
      const { count: listingCount } = await supabase
        .from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      const { data: userListings } = await supabase.from("listings").select("id").eq("user_id", user.id);
      const ids = (userListings || []).map((l: any) => l.id);
      let totalViews = 0;
      let totalFavorites = 0;
      if (ids.length > 0) {
        const { count: viewCount } = await supabase.from("listing_views").select("id", { count: "exact", head: true }).in("listing_id", ids);
        const { count: favCount } = await supabase.from("favorites").select("id", { count: "exact", head: true }).in("listing_id", ids);
        totalViews = viewCount || 0;
        totalFavorites = favCount || 0;
      }
      setStats({ totalListings: listingCount || 0, totalViews, totalFavorites });
    };
    fetchStats();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erreur", description: "Seules les images sont acceptées.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "Fichier trop volumineux (max 5 Mo).", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Erreur", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    if (updateError) {
      toast({ title: "Erreur", description: updateError.message, variant: "destructive" });
    } else {
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast({ title: "Photo de profil mise à jour" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name || null,
      phone: form.phone,
      username: form.username || null,
    }).eq("id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setProfile((prev) => prev ? { ...prev, display_name: form.display_name, phone: form.phone, username: form.username } : prev);
      setEditing(false);
      toast({ title: "Profil mis à jour" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
            <User className="h-11 w-11 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Bienvenue</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connectez-vous pour publier des annonces et gérer votre compte
            </p>
          </div>
          <Button onClick={() => navigate("/auth")} size="lg" className="w-full max-w-xs h-12 text-base rounded-xl font-bold">
            Se connecter
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const displayName = profile?.display_name || user.user_metadata?.display_name || "Utilisateur";
  const displayPhone = profile?.phone || user.phone || user.user_metadata?.phone || "";

  return (
    <div className="min-h-screen bg-background pb-20">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Profile header */}
      <div className="bg-gradient-to-br from-primary via-primary to-chad-blue p-6 pt-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-chad-yellow rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative flex items-center gap-4">
          <button
            className="relative w-18 h-18 rounded-2xl bg-primary-foreground/20 flex items-center justify-center overflow-hidden group shadow-lg"
            style={{ width: '72px', height: '72px' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold truncate">{displayName}</h2>
            <p className="text-sm opacity-80 flex items-center gap-1.5 mt-0.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{displayPhone}</span>
            </p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="bg-primary-foreground/20 rounded-xl p-2.5 hover:bg-primary-foreground/30 transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Edit profile form */}
      {editing && (
        <div className="p-4 bg-card border-b space-y-3 animate-fade-in">
          <h3 className="font-extrabold text-sm text-foreground">Modifier le profil</h3>
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom d'affichage</label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Votre nom" className="h-11 rounded-xl bg-muted/50 border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+235..." className="h-11 rounded-xl bg-muted/50 border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom d'utilisateur</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="@username" className="h-11 rounded-xl bg-muted/50 border-0" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1.5 h-11 rounded-xl font-bold">
              <Check className="h-4 w-4" />
              {saving ? "..." : "Enregistrer"}
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => { setEditing(false); if (profile) setForm({ display_name: profile.display_name || "", phone: profile.phone, username: profile.username || "" }); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { icon: FileText, value: stats.totalListings, label: "Annonces", color: "text-primary" },
          { icon: Eye, value: stats.totalViews, label: "Vues", color: "text-chad-yellow" },
          { icon: Heart, value: stats.totalFavorites, label: "Favoris", color: "text-chad-red" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-3.5 text-center shadow-card">
            <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu items */}
      <div className="px-4 space-y-2">
        {[
          { label: "Mes annonces", icon: FileText, path: "/mes-annonces" },
          { label: "Mes favoris", icon: Heart, path: "/favoris" },
          ...(isAdmin ? [{ label: "Administration", icon: ShieldCheck, path: "/admin" }] : []),
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
          >
            <div className="p-2 rounded-xl bg-accent">
              <item.icon className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground flex-1 text-left">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12"
            onClick={async () => { await signOut(); navigate("/"); }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
