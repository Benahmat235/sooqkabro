import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ImagePlus, ChevronLeft, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/categories";
import { cities, getCityById } from "@/data/cities";
import { useAppToast } from "@/hooks/useAppToast";
import { supabase } from "@/integrations/supabase/client";

const MAX_PHOTOS = 5;

interface ExistingImage {
  id: string;
  image_url: string;
  position: number;
}

const EditListing = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useAppToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [quartierId, setQuartierId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<ExistingImage[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCityData = getCityById(cityId);

  useEffect(() => {
    if (!user || !id) return;
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, user_id, title, description, price, category_id, subcategory_id, city_id, quartier, status, created_at, listing_images(id, image_url, position)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        showError("Cette annonce n'existe pas ou vous n'avez pas les droits.", "Annonce introuvable");
        navigate("/mes-annonces");
        return;
      }

      const { data: phoneVal } = await supabase.rpc("get_my_listing_phone", { _listing_id: id });

      setCategoryId(data.category_id);
      setSubcategoryId(data.subcategory_id);
      setCityId(data.city_id);
      setQuartierId(data.quartier || "");
      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price || ""));
      setPhone((phoneVal || "").replace("+235", ""));
      setExistingImages(
        (data.listing_images || []).sort((a: any, b: any) => a.position - b.position)
      );
      setLoading(false);
    };
    fetchListing();
  }, [user, id]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const totalImages = existingImages.length + newPhotos.length;

  const handleNewPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - totalImages;
    const toAdd = files.slice(0, remaining);
    setNewPhotos((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => setNewPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (img: ExistingImage) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
    setImagesToDelete((prev) => [...prev, img]);
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !subcategoryId || !title || !description || !cityId || !phone) {
      showError("Veuillez remplir tous les champs obligatoires.", "Champs manquants");
      return;
    }

    setSubmitting(true);
    try {
      // Update listing
      const { error } = await supabase
        .from("listings")
        .update({
          title,
          description,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          city_id: cityId,
          quartier: quartierId || null,
          price: parseInt(price) || 0,
          phone: `+235${phone}`,
        })
        .eq("id", id);

      if (error) throw error;

      // Delete removed images
      for (const img of imagesToDelete) {
        try {
          const url = new URL(img.image_url);
          const match = url.pathname.match(/listing-photos\/(.+)/);
          if (match?.[1]) {
            await supabase.storage.from("listing-photos").remove([match[1]]);
          }
        } catch (error) {
          console.error("Failed to delete storage image:", error);
          // Continue with deletion from database even if storage deletion fails
        }
        await supabase.from("listing_images").delete().eq("id", img.id);
      }

      // Upload new photos
      const startPosition = existingImages.length;
      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/${id}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(filePath, file, { upsert: true });

        if (uploadError) continue;

        const { data: urlData } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(filePath);

        await supabase.from("listing_images").insert({
          listing_id: id!,
          image_url: urlData.publicUrl,
          position: startPosition + i,
        });
      }

      success("Annonce modifiee !", "Les changements ont ete enregistres.");
      navigate(`/annonce/${id}`);
    } catch (err: any) {
      showError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-card border-b px-4 py-3 flex items-center gap-3">
        <Link to="/mes-annonces">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold">Modifier l'annonce</h1>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photos */}
          <div className="space-y-2">
            <Label className="font-semibold">Photos (jusqu'à {MAX_PHOTOS})</Label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewPhoto(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {totalImages < MAX_PHOTOS && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-card">
                  <ImagePlus className="h-5 w-5 opacity-40" />
                  <span className="text-[10px] mt-1">Ajouter</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewPhotos} />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="font-semibold">Catégorie *</Label>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-1.5">
              <Label className="font-semibold">Sous-catégorie *</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-semibold">Titre *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Prix (FCFA)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold">Ville *</Label>
              <Select value={cityId} onValueChange={(v) => { setCityId(v); setQuartierId(""); }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedCityData?.quartiers && (
              <div className="space-y-1.5">
                <Label className="font-semibold">Quartier</Label>
                <Select value={quartierId} onValueChange={setQuartierId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {selectedCityData.quartiers.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Téléphone *</Label>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-2.5 rounded-xl">+235</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))} maxLength={8} className="rounded-xl" />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base rounded-xl">
            {submitting ? "Modification en cours..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
};

export default EditListing;
