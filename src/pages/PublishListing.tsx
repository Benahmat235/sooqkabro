import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, ChevronLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/categories";
import { cities, getCityById } from "@/data/cities";
import { useToast } from "@/hooks/use-toast";

const PublishListing = () => {
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityId, setCityId] = useState("ndjamena");
  const [quartierId, setQuartierId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCityData = getCityById(cityId);

  const validatePhone = (p: string) => /^\d{8}$/.test(p);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !subcategoryId || !title || !description || !cityId || !phone) {
      toast({ title: "Erreur", description: "Remplissez tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (!validatePhone(phone)) {
      toast({ title: "Erreur", description: "Le numéro doit contenir 8 chiffres.", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Annonce publiée !", description: "Visible après vérification." });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
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
            <Label className="font-semibold">Photos (jusqu'à 5)</Label>
            <div className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground bg-card">
              <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Appuyez pour ajouter des photos</p>
            </div>
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
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="66 XX XX XX" maxLength={8} className="rounded-xl" />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base rounded-xl">
            Publier l'annonce
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishListing;
