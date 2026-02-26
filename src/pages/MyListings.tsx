import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  city_id: string;
  images: { image_url: string }[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Publiée", variant: "default" },
  draft: { label: "Brouillon", variant: "secondary" },
  archived: { label: "Archivée", variant: "outline" },
};

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, status, created_at, city_id, listing_images(image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setListings(
        (data || []).map((l: any) => ({
          ...l,
          images: l.listing_images || [],
        }))
      );
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link to="/compte">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Mes annonces</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Vous n'avez pas encore d'annonces</p>
            <Button asChild>
              <Link to="/publier">
                <Plus className="h-4 w-4 mr-2" />
                Publier une annonce
              </Link>
            </Button>
          </div>
        ) : (
          listings.map((listing) => {
            const st = statusLabels[listing.status] || statusLabels.draft;
            return (
              <Link
                key={listing.id}
                to={`/annonce/${listing.id}`}
                className="flex gap-3 p-3 bg-card rounded-lg border"
              >
                <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {listing.images[0] ? (
                    <img src={listing.images[0].image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Photo
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{listing.title}</p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {listing.price.toLocaleString()} FCFA
                  </p>
                  <Badge variant={st.variant} className="mt-1 text-xs">
                    {st.label}
                  </Badge>
                </div>
              </Link>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MyListings;
