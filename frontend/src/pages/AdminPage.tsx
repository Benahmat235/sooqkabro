import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useMerchants, useToggleVerified } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, ChevronLeft, Search, ShieldCheck, Store, Users, Flag, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import BottomNav from "@/components/BottomNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FlaggedRow {
  id: string;
  listing_id: string;
  reason: string;
  details: any;
  flagged_at: string;
  reviewed: boolean;
  listing?: { title: string; price: number; status: string } | null;
}

function useListingFlags() {
  return useQuery({
    queryKey: ["listing-flags"],
    queryFn: async (): Promise<FlaggedRow[]> => {
      const { data, error } = await supabase
        .from("listing_flags" as any)
        .select("id, listing_id, reason, details, flagged_at, reviewed")
        .order("flagged_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const rows = (data || []) as any as FlaggedRow[];
      const ids = [...new Set(rows.map((r) => r.listing_id))];
      if (ids.length === 0) return rows;
      const { data: listings } = await supabase
        .from("listings")
        .select("id, title, price, status")
        .in("id", ids);
      const byId = new Map((listings || []).map((l: any) => [l.id, l]));
      return rows.map((r) => ({ ...r, listing: byId.get(r.listing_id) || null }));
    },
  });
}


const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: merchants = [], isLoading: merchantsLoading } = useMerchants();
  const toggleVerified = useToggleVerified();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-extrabold text-foreground">Accès refusé</h1>
        <p className="text-sm text-muted-foreground text-center">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const filtered = merchants.filter((m) => {
    const matchesSearch =
      !search ||
      (m.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.username || "").toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && m.is_verified) ||
      (filter === "unverified" && !m.is_verified);
    return matchesSearch && matchesFilter;
  });

  const verifiedCount = merchants.filter((m) => m.is_verified).length;

  const handleToggle = async (merchantId: string, currentStatus: boolean) => {
    try {
      await toggleVerified.mutateAsync({ merchantId, verified: !currentStatus });
      toast({
        title: currentStatus ? "Vérification retirée" : "Marchand vérifié ✅",
        description: currentStatus
          ? "Le badge vérifié a été retiré."
          : "Le marchand a obtenu le badge vérifié.",
      });
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-chad-blue p-6 pt-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-chad-yellow rounded-full -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="relative">
          <button onClick={() => navigate("/compte")} className="mb-3 flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity">
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary-foreground/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Administration</h1>
              <p className="text-sm opacity-80">Gestion des marchands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-card rounded-2xl p-3 text-center shadow-card">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-extrabold text-foreground">{merchants.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center shadow-card">
          <BadgeCheck className="h-4 w-4 mx-auto mb-1 text-success" />
          <p className="text-lg font-extrabold text-foreground">{verifiedCount}</p>
          <p className="text-[10px] text-muted-foreground">Vérifiés</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center shadow-card">
          <Store className="h-4 w-4 mx-auto mb-1 text-chad-yellow" />
          <p className="text-lg font-extrabold text-foreground">{merchants.length - verifiedCount}</p>
          <p className="text-[10px] text-muted-foreground">Non vérifiés</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un marchand..."
            className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "verified", "unverified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {f === "all" ? "Tous" : f === "verified" ? "Vérifiés" : "Non vérifiés"}
            </button>
          ))}
        </div>
      </div>

      {/* Merchants list */}
      <div className="px-4 mt-4 space-y-2">
        {merchantsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucun marchand trouvé</p>
          </div>
        ) : (
          filtered.map((merchant) => (
            <div
              key={merchant.id}
              className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3"
            >
              <img
                src={merchant.avatar_url || "/placeholder.svg"}
                alt=""
                className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground truncate">
                    {merchant.display_name || merchant.username || "Sans nom"}
                  </span>
                  {merchant.is_verified && (
                    <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{merchant.phone}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {merchant.listing_count} annonce{merchant.listing_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    · {formatDistanceToNow(new Date(merchant.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant={merchant.is_verified ? "outline" : "default"}
                className={cn(
                  "rounded-xl text-xs shrink-0 h-9",
                  merchant.is_verified && "border-destructive text-destructive hover:bg-destructive/5"
                )}
                onClick={() => handleToggle(merchant.id, merchant.is_verified)}
                disabled={toggleVerified.isPending}
              >
                {merchant.is_verified ? "Retirer" : "Vérifier"}
              </Button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPage;
