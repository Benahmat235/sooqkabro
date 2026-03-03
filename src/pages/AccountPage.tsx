import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogOut, Phone, ChevronRight, Eye, FileText, Heart, Pencil, Check, X, Camera } from "lucide-react";
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
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

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

      setStats({ totalListings: listingCount || 0, totalViews, totalFavorites });
    };
    fetchStats();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(path, file, { upsert: true });

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

  const displayName = profile?.display_name || user.user_metadata?.display_name || "Utilisateur";
  const displayPhone = profile?.phone || user.phone || user.user_metadata?.phone || "";

  return (
    <div className="min-h-screen bg-background pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Profile header */}
      <div className="bg-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <button
            className="relative w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden group"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-sm opacity-80 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {displayPhone}
            </p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="bg-primary-foreground/20 rounded-full p-2">
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Edit profile form */}
      {editing && (
        <div className="p-4 bg-card border-b space-y-3">
          <h3 className="font-bold text-sm text-foreground">Modifier le profil</h3>
          <div>
            <label className="text-xs text-muted-foreground">Nom d'affichage</label>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Votre nom" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Téléphone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+235..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Nom d'utilisateur</label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="@username" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1">
              <Check className="h-4 w-4" />
              {saving ? "..." : "Enregistrer"}
            </Button>
            <Button variant="outline" onClick={() => { setEditing(false); if (profile) setForm({ display_name: profile.display_name || "", phone: profile.phone, username: profile.username || "" }); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
        <button onClick={() => navigate("/mes-annonces")} className="w-full flex items-center justify-between p-4 bg-card rounded-lg border">
          <span className="font-medium text-foreground">Mes annonces</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        <button onClick={() => navigate("/favoris")} className="w-full flex items-center justify-between p-4 bg-card rounded-lg border">
          <span className="font-medium text-foreground">Mes favoris</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={async () => { await signOut(); navigate("/"); }}
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
