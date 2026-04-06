import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useSellerStats } from "@/hooks/useSellerStats";
import { useSellerReviews, useSellerRating } from "@/hooks/useSellerReviews";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, LogOut, Phone, ChevronRight, Eye, FileText, Heart, Pencil, Check, X, Camera, 
  ShieldCheck, BadgeCheck, Star, MapPin, Calendar, Share2, Settings, Bell, Globe, 
  Lock, HelpCircle, MessageSquare, Clock, TrendingUp, Users, Package, Loader2
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
  is_verified: boolean;
  created_at: string;
}

interface RecentActivity {
  type: "listing" | "favorite" | "message" | "review";
  title: string;
  time: Date;
  id?: string;
}

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({ totalListings: 0, totalViews: 0, totalFavorites: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: "", phone: "", username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sellerStats } = useSellerStats(user?.id);
  const { avg: sellerAvg, count: reviewCount } = useSellerRating(user?.id);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, phone, username, avatar_url, is_verified, created_at").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({ display_name: data.display_name || "", phone: data.phone || "", username: data.username || "", bio: "" });
        }
      });

    const fetchStats = async () => {
      const { count: listingCount } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      const { data: userListings } = await supabase.from("listings").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3);
      const ids = (userListings || []).map((l: any) => l.id);
      let totalViews = 0, totalFavorites = 0;
      if (ids.length > 0) {
        const { count: viewCount } = await supabase.from("listing_views").select("id", { count: "exact", head: true }).in("listing_id", ids);
        const { count: favCount } = await supabase.from("favorites").select("id", { count: "exact", head: true }).in("listing_id", ids);
        totalViews = viewCount || 0;
        totalFavorites = favCount || 0;
      }
      setStats({ totalListings: listingCount || 0, totalViews, totalFavorites });

      // Build recent activity
      const activities: RecentActivity[] = [];
      (userListings || []).forEach((l: any) => {
        activities.push({ type: "listing", title: l.title, time: new Date(l.created_at), id: l.id });
      });
      setRecentActivity(activities.slice(0, 5));
    };
    fetchStats();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast({ title: t("common.error"), description: t("publish.imagesOnly"), variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: t("common.error"), description: t("publish.fileTooLarge"), variant: "destructive" }); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: t("common.error"), description: uploadError.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    if (updateError) { toast({ title: t("common.error"), description: updateError.message, variant: "destructive" }); }
    else { setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev); toast({ title: t("account.photoUpdated") }); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: form.display_name || null, phone: form.phone, username: form.username || null }).eq("id", user.id);
    if (error) { toast({ title: t("common.error"), description: error.message, variant: "destructive" }); }
    else { setProfile((prev) => prev ? { ...prev, display_name: form.display_name, phone: form.phone, username: form.username } : prev); setEditing(false); toast({ title: t("account.profileUpdated") }); }
    setSaving(false);
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/vendeur/${user?.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: t("detail.copied"), description: t("detail.linkCopied") });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-primary via-primary to-chad-blue p-6 pt-10">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}
        </div>
        <BottomNav />
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
            <h2 className="text-2xl font-extrabold text-foreground">{t("account.welcome")}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">{t("account.loginPrompt")}</p>
          </div>
          <Button onClick={() => navigate("/auth")} size="lg" className="w-full max-w-xs h-12 text-base rounded-xl font-bold">
            {t("auth.loginBtn")}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const displayName = profile?.display_name || user.user_metadata?.display_name || "Utilisateur";
  const displayPhone = profile?.phone || user.phone || user.user_metadata?.phone || "";
  const memberSince = profile?.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: fr }) : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-chad-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-chad-yellow rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary-foreground rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        
        <div className="relative px-4 pt-10 pb-6">
          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={handleShareProfile}
              className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === "settings" ? "overview" : "settings")}
              className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex items-start gap-4">
            <button 
              className="relative w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center overflow-hidden group shadow-lg border-2 border-primary-foreground/30" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-9 w-9 text-primary-foreground" />
              )}
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                </div>
              )}
            </button>
            
            <div className="flex-1 min-w-0 text-primary-foreground pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold truncate">{displayName}</h2>
                {profile?.is_verified && <BadgeCheck className="h-5 w-5 text-chad-yellow shrink-0" />}
              </div>
              {profile?.username && (
                <p className="text-sm opacity-80">@{profile.username}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                {displayPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {displayPhone}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating & Response */}
          <div className="flex items-center gap-4 mt-4 text-primary-foreground">
            {reviewCount > 0 && (
              <div className="flex items-center gap-1.5 bg-primary-foreground/20 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 fill-chad-yellow text-chad-yellow" />
                <span className="font-bold text-sm">{sellerAvg.toFixed(1)}</span>
                <span className="text-xs opacity-80">({reviewCount} avis)</span>
              </div>
            )}
            {sellerStats && (
              <div className="flex items-center gap-1.5 bg-primary-foreground/20 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{sellerStats.responseRate}% reponse</span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {!editing && (
            <Button 
              onClick={() => setEditing(true)}
              variant="secondary"
              size="sm"
              className="mt-4 rounded-xl font-semibold"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              {t("account.editProfile")}
            </Button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="p-4 bg-card border-b space-y-3 animate-fade-in">
          <h3 className="font-extrabold text-sm text-foreground">{t("account.editProfile")}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("account.displayName")}</label>
              <Input 
                value={form.display_name} 
                onChange={(e) => setForm({ ...form, display_name: e.target.value })} 
                className="h-11 rounded-xl bg-muted/50 border-0" 
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("account.username")}</label>
              <Input 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                placeholder="@username" 
                className="h-11 rounded-xl bg-muted/50 border-0" 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("account.phone")}</label>
              <Input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="h-11 rounded-xl bg-muted/50 border-0" 
                placeholder="+235 XX XX XX XX"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1.5 h-11 rounded-xl font-bold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "..." : t("account.save")}
            </Button>
            <Button 
              variant="outline" 
              className="h-11 rounded-xl px-4" 
              onClick={() => { 
                setEditing(false); 
                if (profile) setForm({ display_name: profile.display_name || "", phone: profile.phone, username: profile.username || "", bio: "" }); 
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Package, value: stats.totalListings, label: "Annonces", color: "text-primary bg-primary/10" },
              { icon: Eye, value: stats.totalViews, label: "Vues", color: "text-amber-600 bg-amber-50" },
              { icon: Heart, value: stats.totalFavorites, label: "Favoris", color: "text-rose-600 bg-rose-50" },
              { icon: Users, value: sellerStats?.responseRate || 0, label: "Reponse %", color: "text-emerald-600 bg-emerald-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-3 text-center shadow-sm border">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">Actions rapides</h3>
            {[
              { label: t("account.myListings"), icon: FileText, path: "/mes-annonces", color: "bg-primary/10 text-primary" },
              { label: t("account.myFavorites"), icon: Heart, path: "/favoris", color: "bg-rose-50 text-rose-600" },
              { label: "Messages", icon: MessageSquare, path: "/messages", color: "bg-blue-50 text-blue-600" },
              { label: "Ma boutique", icon: TrendingUp, path: `/vendeur/${user?.id}`, color: "bg-emerald-50 text-emerald-600" },
              ...(isAdmin ? [{ label: t("account.admin"), icon: ShieldCheck, path: "/admin", color: "bg-amber-50 text-amber-600" }] : []),
            ].map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-sm border hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className={cn("p-2.5 rounded-xl", item.color)}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">Activite recente</h3>
              <div className="bg-card rounded-2xl border overflow-hidden">
                {recentActivity.map((activity, i) => (
                  <Link 
                    key={i} 
                    to={activity.type === "listing" ? `/annonce/${activity.id}` : "#"}
                    className={cn(
                      "flex items-center gap-3 p-3",
                      i !== recentActivity.length - 1 && "border-b"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      activity.type === "listing" && "bg-primary/10 text-primary",
                      activity.type === "favorite" && "bg-rose-50 text-rose-600",
                      activity.type === "message" && "bg-blue-50 text-blue-600"
                    )}>
                      {activity.type === "listing" && <Package className="h-4 w-4" />}
                      {activity.type === "favorite" && <Heart className="h-4 w-4" />}
                      {activity.type === "message" && <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.time, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Settings Tab */
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">Parametres</h3>
            {[
              { label: "Notifications", icon: Bell, description: "Gerer vos alertes" },
              { label: "Langue", icon: Globe, description: "Francais" },
              { label: "Securite", icon: Lock, description: "Mot de passe et connexion" },
              { label: "Aide et support", icon: HelpCircle, description: "FAQ et contact" },
            ].map((item) => (
              <button 
                key={item.label} 
                className="w-full flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-sm border hover:shadow-md transition-all text-left"
              >
                <div className="p-2.5 rounded-xl bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-foreground block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Verification Status */}
          {!profile?.is_verified && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100">
                  <BadgeCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-900">Verifiez votre compte</h4>
                  <p className="text-xs text-amber-700 mt-0.5">Obtenez le badge verifie pour gagner la confiance des acheteurs</p>
                  <Button size="sm" className="mt-3 rounded-xl bg-amber-600 hover:bg-amber-700">
                    Commencer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="px-4 pb-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12" 
          onClick={async () => { await signOut(); navigate("/"); }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {t("account.logout")}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
