import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Archive, Trash2, MoreVertical, RotateCcw, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QualityIndicator } from "@/components/QualityIndicator";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  city_id: string;
  quartier: string | null;
  phone: string;
  images: { image_url: string }[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Publiée", variant: "default" },
  draft: { label: "Brouillon", variant: "secondary" },
  archived: { label: "Archivée", variant: "outline" },
};

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    if (!user) return;
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

  useEffect(() => {
    fetchListings();
  }, [user]);

  const archiveListing = async (listing: Listing) => {
    const newStatus = listing.status === "archived" ? "published" : "archived";
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listing.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: newStatus === "archived" ? "Annonce archivée" : "Annonce republiée",
      description: newStatus === "archived" ? "L'annonce n'est plus visible." : "L'annonce est de nouveau visible.",
    });
    fetchListings();
  };

  const deleteListing = async (listing: Listing) => {
    // Delete images from storage first
    if (listing.images.length > 0) {
      const paths = listing.images
        .map((img) => {
          try {
            const url = new URL(img.image_url);
            const match = url.pathname.match(/listing-photos\/(.+)/);
            return match?.[1] || null;
          } catch { return null; }
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from("listing-photos").remove(paths);
      }
    }

    // Delete image records then listing
    await supabase.from("listing_images").delete().eq("listing_id", listing.id);
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Annonce supprimée" });
    setDeleteTarget(null);
    fetchListings();
  };

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
              <div key={listing.id} className="flex gap-3 p-3 bg-card rounded-lg border">
                <Link to={`/annonce/${listing.id}`} className="flex gap-3 flex-1 min-w-0">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="self-start p-1.5 rounded-md hover:bg-muted">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/modifier/${listing.id}`)}>
                      <Pencil className="h-4 w-4 mr-2" />Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => archiveListing(listing)}>
                      {listing.status === "archived" ? (
                        <><RotateCcw className="h-4 w-4 mr-2" />Republier</>
                      ) : (
                        <><Archive className="h-4 w-4 mr-2" />Archiver</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(listing)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.title} » sera définitivement supprimée avec ses photos. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteListing(deleteTarget)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default MyListings;
