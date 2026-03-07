import { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePhoneValidation } from "@/hooks/usePhoneValidation";
import { PhoneValidationIndicator } from "@/components/PhoneValidationIndicator";

const MAX_PHOTOS = 5;

const PublishListing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityId, setCityId] = useState("ndjamena");
  const [quartierId, setQuartierId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { phoneValid, validating, validatePhone, resetValidation } = usePhoneValidation();

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCityData = getCityById(cityId);

  const isPhoneFormatValid = (p: string) => /^\d{8}$/.test(p);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast({ title: "Erreur", description: "Seules les images sont acceptées.", variant: "destructive" });
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: "Erreur", description: "Fichier trop volumineux (max 5 Mo).", variant: "destructive" });
        return false;
      }
      return true;
    });
    const toAdd = validFiles.slice(0, remaining);
    setPhotos((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !subcategoryId || !title || !description || !cityId || !phone) {
      toast({ title: "Erreur", description: "Remplissez tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (!isPhoneFormatValid(phone)) {
      toast({ title: "Erreur", description: "Le numéro doit contenir 8 chiffres.", variant: "destructive" });
      return;
    }
    if (phoneValid === false) {
      toast({ title: "Erreur", description: "Le numéro de téléphone est invalide.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          title,
          description,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          city_id: cityId,
          quartier: quartierId || null,
          price: parseInt(price) || 0,
          phone: `+235${phone}`,
          status: "published",
        })
        .select("id")
        .single();

      if (listingError) throw listingError;

      // 2. Upload photos via Cloudinary & insert image records
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        try {
          const formData = new FormData();
          formData.append("file", file);

          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const uploadData = await res.json();
          if (!res.ok || !uploadData.url) {
            console.error("Upload error:", uploadData.error);
            continue;
          }

          await supabase.from("listing_images").insert({
            listing_id: listing.id,
            image_url: uploadData.url,
            position: i,
          });
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          continue;
        }
      }

      toast({ title: "✅ Annonce publiée !", description: "Votre annonce est maintenant visible." });
      navigate(`/annonce/${listing.id}`);
    } catch (err: any) {
      console.error("Publish error:", err);
      toast({ title: "Erreur", description: err.message || "Impossible de publier.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-card border-b px-4 py-3 flex items-center gap-3">
        <Link to="/">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold">Publier une annonce</h1>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photos */}
          <div className="space-y-2">
            <Label className="font-semibold">Photos (jusqu'à {MAX_PHOTOS})</Label>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-card"
                >
                  <ImagePlus className="h-5 w-5 opacity-40" />
                  <span className="text-[10px] mt-1">Ajouter</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="font-semibold">Catégorie *</Label>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-1.5">
              <Label className="font-semibold">Sous-catégorie *</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-semibold">Titre *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Toyota Hilux 2020" maxLength={100} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre article..." rows={4} maxLength={2000} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Prix (FCFA)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Gratuit" min={0} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold">Ville *</Label>
              <Select value={cityId} onValueChange={(v) => { setCityId(v); setQuartierId(""); }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCityData?.quartiers && (
              <div className="space-y-1.5">
                <Label className="font-semibold">Quartier</Label>
                <Select value={quartierId} onValueChange={setQuartierId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {selectedCityData.quartiers.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Téléphone *</Label>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-2.5 rounded-xl">+235</span>
              <div className="relative flex-1">
                <Input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 8)); resetValidation(); }}
                  onBlur={() => { if (phone.length === 8) validatePhone(phone); }}
                  placeholder="66 XX XX XX"
                  maxLength={8}
                  className="rounded-xl pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PhoneValidationIndicator phoneValid={phoneValid} validating={validating} />
                </div>
              </div>
            </div>
            {phoneValid === false && <p className="text-xs text-destructive mt-1">Numéro de téléphone invalide</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base rounded-xl"
          >
            {submitting ? "Publication en cours..." : "Publier l'annonce"}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishListing;
