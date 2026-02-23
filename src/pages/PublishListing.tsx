import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImagePlus } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/categories";
import { cities, getCityById } from "@/data/cities";
import { useToast } from "@/hooks/use-toast";

const PublishListing = () => {
  const [selectedCity, setSelectedCity] = useState("all");
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
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (!validatePhone(phone)) {
      toast({ title: "Erreur", description: "Le numéro doit contenir exactement 8 chiffres.", variant: "destructive" });
      return;
    }

    toast({ title: "✅ Annonce publiée !", description: "Votre annonce sera visible après vérification." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Publier une annonce</span>
        </div>

        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Publier une annonce
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-xl border p-5">
          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie *</Label>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
              <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <Label>Sous-catégorie *</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>Titre de l'annonce *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Toyota Hilux 2020 en bon état" maxLength={100} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre article en détail..." rows={5} maxLength={2000} />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>Prix (FCFA)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Gratuit / À négocier" min={0} />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ville *</Label>
              <Select value={cityId} onValueChange={(v) => { setCityId(v); setQuartierId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCityData?.quartiers && (
              <div className="space-y-2">
                <Label>Quartier</Label>
                <Select value={quartierId} onValueChange={setQuartierId}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {selectedCityData.quartiers.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Numéro de téléphone *</Label>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-2 rounded-md">+235</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="66 XX XX XX" maxLength={8} />
            </div>
            <p className="text-xs text-muted-foreground">8 chiffres, sans l'indicatif</p>
          </div>

          {/* Photos placeholder */}
          <div className="space-y-2">
            <Label>Photos (jusqu'à 5)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <ImagePlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Upload de photos disponible prochainement</p>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base">
            Publier l'annonce
          </Button>
        </form>
      </main>
    </div>
  );
};

export default PublishListing;
