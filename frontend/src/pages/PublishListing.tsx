import { useState, useRef, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ImagePlus, ChevronLeft, X, Loader2, Info, Car, Home, Smartphone, Briefcase, Wrench, PawPrint, Shirt, Sofa, Monitor, UtensilsCrossed, Package, UserSearch } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/data/categories";
import { cities, getCityById } from "@/data/cities";
import { useAppToast } from "@/hooks/useAppToast";
import { supabase } from "@/integrations/supabase/client";
import { usePhoneValidation } from "@/hooks/usePhoneValidation";
import { PhoneValidationIndicator } from "@/components/PhoneValidationIndicator";
import { cn } from "@/lib/utils";
import { QualityIndicator } from "@/components/QualityIndicator";

const MAX_PHOTOS = 5;

// Category-specific field definitions
const categoryFields: Record<string, { label: string; type: string; options?: string[]; placeholder?: string; required?: boolean }[]> = {
  "vehicules:voitures": [
    { label: "Marque", type: "select", options: ["Toyota", "Hyundai", "BMW", "Mercedes", "Renault", "Nissan", "Peugeot", "Kia", "Honda", "Mitsubishi", "Suzuki", "Ford", "Volkswagen", "Autre"], required: true },
    { label: "Modele", type: "text", placeholder: "Ex: Corolla, Tucson, Serie 3, Clio", required: true },
    { label: "Annee", type: "select", options: Array.from({ length: 35 }, (_, i) => String(2025 - i)), required: true },
    { label: "Kilometrage (km)", type: "number", placeholder: "Ex: 50000", required: true },
    { label: "Etat du vehicule", type: "select", options: ["Neuf", "Tres bon", "Bon", "Accidente", "A reparer"], required: true },
    { label: "Carburant", type: "select", options: ["Essence", "Diesel", "Hybride", "Electrique", "GPL"] },
    { label: "Transmission / vitesse", type: "select", options: ["Manuelle", "Automatique"] },
    { label: "Type de carrosserie", type: "select", options: ["Berline", "SUV", "Citadine", "Coupe", "Pickup", "Utilitaire"] },
    { label: "Couleur exterieure", type: "select", options: ["Blanc", "Noir", "Gris", "Argent", "Bleu", "Rouge", "Vert", "Beige", "Marron", "Autre"] },
    { label: "Nombre de portes", type: "select", options: ["2", "3", "4", "5"] },
    { label: "Nombre de places", type: "select", options: ["2", "4", "5", "6", "7", "8+"] },
    { label: "Puissance / moteur", type: "text", placeholder: "Ex: 1.6L, 2.0L, V6" },
    { label: "Origine", type: "select", options: ["Importee", "Locale", "Premiere main"] },
    { label: "Dedouanee", type: "select", options: ["Oui", "Non"] },
    { label: "Documents disponibles", type: "multiselect", options: ["Carte grise", "Controle technique", "Assurance"] },
    { label: "Historique d'accident", type: "select", options: ["Jamais accidentee", "Accident leger", "Accident majeur"] },
    { label: "Options", type: "multiselect", options: ["Climatisation", "Camera recul", "GPS", "Toit ouvrant", "Cuir", "Bluetooth", "Radar", "ABS"] },
    { label: "Localisation precise", type: "text", placeholder: "Ex: N'Djamena, Moursal, pres du marche" },
    { label: "Disponibilite pour visite", type: "select", options: ["Disponible maintenant", "Sur rendez-vous"] },
  ],
  vehicules: [
    { label: "Marque", type: "text", placeholder: "Ex: Yamaha, Honda, Toyota", required: true },
    { label: "Modele", type: "text", placeholder: "Ex: Wave, Hilux, Actros", required: true },
    { label: "Annee", type: "select", options: Array.from({ length: 35 }, (_, i) => String(2025 - i)), required: true },
    { label: "Etat", type: "select", options: ["Neuf", "Tres bon", "Bon", "Accidente", "A reparer"], required: true },
  ],
  immobilier: [
    { label: "Type de bien", type: "select", options: ["Maison", "Appartement", "Studio", "Villa", "Terrain", "Bureau", "Magasin", "Entrepot"], required: true },
    { label: "Transaction", type: "select", options: ["Vente", "Location", "Colocation"], required: true },
    { label: "Surface (m2)", type: "number", placeholder: "Ex: 120", required: true },
    { label: "Nombre de chambres", type: "select", options: ["Studio", "1", "2", "3", "4", "5", "6+"] },
    { label: "Nombre de salles de bain", type: "select", options: ["1", "2", "3", "4+"] },
    { label: "Meuble", type: "select", options: ["Oui", "Non", "Partiellement"] },
    { label: "Parking", type: "select", options: ["Oui", "Non"] },
    { label: "Climatisation", type: "select", options: ["Oui", "Non", "Partielle"] },
    { label: "Groupe electrogene", type: "select", options: ["Oui", "Non", "Partage"] },
    { label: "Eau courante", type: "select", options: ["Oui", "Non", "Forage"] },
  ],
  telephones: [
    { label: "Marque", type: "select", options: ["Apple", "Samsung", "Tecno", "Infinix", "Itel", "Xiaomi", "Huawei", "Oppo", "Vivo", "Nokia", "Realme", "Autre"], required: true },
    { label: "Modele", type: "text", placeholder: "Ex: iPhone 14 Pro, Galaxy S23", required: true },
    { label: "Capacite stockage", type: "select", options: ["16 Go", "32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To"] },
    { label: "Memoire RAM", type: "select", options: ["2 Go", "3 Go", "4 Go", "6 Go", "8 Go", "12 Go", "16 Go"] },
    { label: "Etat", type: "select", options: ["Neuf sous emballage", "Neuf sans emballage", "Excellent", "Bon", "Acceptable", "Pour pieces"], required: true },
    { label: "Batterie", type: "select", options: ["100%", "90-99%", "80-89%", "70-79%", "Moins de 70%", "A remplacer"] },
    { label: "Accessoires inclus", type: "multiselect", options: ["Chargeur", "Ecouteurs", "Coque", "Protection ecran", "Boite originale"] },
  ],
  emploi: [
    { label: "Type d'offre", type: "select", options: ["CDI", "CDD", "Stage", "Freelance", "Temps partiel", "Interim"], required: true },
    { label: "Secteur", type: "select", options: ["Administration", "Commerce", "Construction", "Education", "Finance", "Hotellerie", "Informatique", "Logistique", "Marketing", "Sante", "Securite", "Telecom", "Autre"], required: true },
    { label: "Experience requise", type: "select", options: ["Debutant accepte", "1-2 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans"] },
    { label: "Niveau d'etudes", type: "select", options: ["Sans diplome", "BEPC", "Baccalaureat", "BTS/DUT", "Licence", "Master", "Doctorat"] },
    { label: "Salaire mensuel (FCFA)", type: "number", placeholder: "Ex: 150000" },
    { label: "Avantages", type: "multiselect", options: ["Transport", "Logement", "Repas", "Assurance", "Formation", "Prime"] },
  ],
  services: [
    { label: "Type de service", type: "select", options: ["Ponctuel", "Regulier", "Sur devis", "Forfait"], required: true },
    { label: "Disponibilite", type: "select", options: ["Immediate", "Sous 24h", "Sous 48h", "Sur rendez-vous", "Week-end uniquement"] },
    { label: "Zone d'intervention", type: "select", options: ["A domicile", "Sur place", "Toute la ville", "Region"] },
    { label: "Experience", type: "select", options: ["Moins d'1 an", "1-3 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans"] },
    { label: "Certifications", type: "text", placeholder: "Ex: Electricien agree, Plombier certifie" },
  ],
  animaux: [
    { label: "Type d'animal", type: "select", options: ["Chien", "Chat", "Volaille", "Mouton", "Chevre", "Vache", "Cheval", "Lapin", "Oiseau", "Poisson", "Autre"], required: true },
    { label: "Race", type: "text", placeholder: "Ex: Berger allemand, Siamois" },
    { label: "Age", type: "select", options: ["Moins de 3 mois", "3-6 mois", "6-12 mois", "1-2 ans", "2-5 ans", "Plus de 5 ans"] },
    { label: "Sexe", type: "select", options: ["Male", "Femelle", "Non precise"] },
    { label: "Vaccine", type: "select", options: ["Oui, carnet a jour", "Partiellement", "Non", "Non applicable"] },
    { label: "Puce/Tatouage", type: "select", options: ["Oui", "Non", "Non applicable"] },
  ],
  mode: [
    { label: "Type", type: "select", options: ["Vetement", "Chaussure", "Accessoire", "Bijou", "Sac", "Montre", "Tissu"], required: true },
    { label: "Genre", type: "select", options: ["Homme", "Femme", "Enfant", "Unisexe"], required: true },
    { label: "Taille", type: "text", placeholder: "Ex: M, 42, 38" },
    { label: "Couleur", type: "select", options: ["Blanc", "Noir", "Gris", "Bleu", "Rouge", "Vert", "Jaune", "Rose", "Orange", "Violet", "Marron", "Beige", "Multicolore"] },
    { label: "Marque", type: "text", placeholder: "Ex: Nike, Zara, Local" },
    { label: "Etat", type: "select", options: ["Neuf avec etiquette", "Neuf sans etiquette", "Tres bon", "Bon", "Acceptable"], required: true },
    { label: "Matiere", type: "text", placeholder: "Ex: Coton, Cuir, Wax" },
  ],
  maison: [
    { label: "Type de meuble", type: "select", options: ["Canape", "Table", "Chaise", "Lit", "Armoire", "Bureau", "Etagere", "Electromenager", "Decoration", "Autre"], required: true },
    { label: "Materiau", type: "select", options: ["Bois", "Metal", "Plastique", "Tissu", "Cuir", "Verre", "Mixte"] },
    { label: "Etat", type: "select", options: ["Neuf", "Comme neuf", "Bon", "Acceptable", "A renover"], required: true },
    { label: "Dimensions", type: "text", placeholder: "Ex: 200x150x80 cm" },
    { label: "Couleur", type: "select", options: ["Blanc", "Noir", "Marron", "Beige", "Gris", "Autre"] },
    { label: "Livraison possible", type: "select", options: ["Oui, gratuite", "Oui, payante", "Non, a recuperer"] },
  ],
  electronique: [
    { label: "Type", type: "select", options: ["Ordinateur portable", "Ordinateur fixe", "Television", "Console", "Tablette", "Imprimante", "Accessoire", "Autre"], required: true },
    { label: "Marque", type: "text", placeholder: "Ex: HP, Dell, LG, Sony", required: true },
    { label: "Modele", type: "text", placeholder: "Ex: MacBook Pro 2023" },
    { label: "Etat", type: "select", options: ["Neuf", "Excellent", "Bon", "Acceptable", "Pour pieces"], required: true },
    { label: "Garantie", type: "select", options: ["Sous garantie", "Garantie expiree", "Sans garantie"] },
    { label: "Accessoires inclus", type: "text", placeholder: "Ex: Chargeur, souris, clavier" },
  ],
  alimentation: [
    { label: "Type", type: "select", options: ["Produits frais", "Produits secs", "Boissons", "Plats prepares", "Patisserie", "Viande", "Poisson", "Fruits et legumes"], required: true },
    { label: "Origine", type: "select", options: ["Production locale", "Importe", "Bio", "Artisanal"] },
    { label: "Conservation", type: "select", options: ["Temperature ambiante", "Refrigere", "Congele"] },
    { label: "Quantite disponible", type: "text", placeholder: "Ex: 50 kg, 100 unites" },
    { label: "Date limite", type: "text", placeholder: "Ex: 30/12/2025" },
    { label: "Livraison", type: "select", options: ["Oui", "Non", "A discuter"] },
  ],
};

const categoryIcons: Record<string, any> = {
  vehicules: Car,
  immobilier: Home,
  telephones: Smartphone,
  emploi: Briefcase,
  services: Wrench,
  animaux: PawPrint,
  mode: Shirt,
  maison: Sofa,
  electronique: Monitor,
  alimentation: UtensilsCrossed,
};

const listingTypes = [
  {
    id: "sell-product",
    title: "Vendre un produit",
    description: "Telephone, meuble, electronique, vetement, animal ou produit alimentaire.",
    categoryId: "telephones",
    subcategoryId: "iphone",
    icon: Package,
    accent: "bg-primary/10 text-primary",
    examples: ["Produit d'occasion", "Produit neuf", "Accessoire"],
  },
  {
    id: "vehicle",
    title: "Vehicule",
    description: "Voiture, moto, camion, pieces detachees ou location de vehicule.",
    categoryId: "vehicules",
    subcategoryId: "voitures",
    icon: Car,
    accent: "bg-blue-50 text-blue-700",
    examples: ["Marque", "Annee", "Kilometrage"],
  },
  {
    id: "property",
    title: "Immobilier",
    description: "Maison, appartement, terrain, bureau, commerce ou colocation.",
    categoryId: "immobilier",
    subcategoryId: "maisons-vente",
    icon: Home,
    accent: "bg-green-50 text-green-700",
    examples: ["Surface", "Transaction", "Chambres"],
  },
  {
    id: "job",
    title: "Emploi ou candidat",
    description: "Offre d'emploi, recherche d'emploi, stage ou formation.",
    categoryId: "emploi",
    subcategoryId: "offres-emploi",
    icon: Briefcase,
    accent: "bg-amber-50 text-amber-700",
    examples: ["Contrat", "Secteur", "Experience"],
  },
  {
    id: "service",
    title: "Service",
    description: "Travaux, transport, informatique, securite, photo, telecom ou aide a domicile.",
    categoryId: "services",
    subcategoryId: "construction",
    icon: Wrench,
    accent: "bg-cyan-50 text-cyan-700",
    examples: ["Disponibilite", "Zone", "Experience"],
  },
  {
    id: "candidate",
    title: "Profil candidat",
    description: "Se presenter comme demandeur d'emploi ou prestataire disponible.",
    categoryId: "emploi",
    subcategoryId: "recherche-emploi",
    icon: UserSearch,
    accent: "bg-purple-50 text-purple-700",
    examples: ["Competences", "Disponibilite", "Ville"],
  },
] as const;

const PublishListing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityId, setCityId] = useState("ndjamena");
  const [quartierId, setQuartierId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "negotiable" | "free">("fixed");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string | string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, error: showError, success } = useAppToast();
  const { phoneValid, validating, validatePhone, resetValidation } = usePhoneValidation();

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedListingType = listingTypes.find((type) => type.id === listingType);
  const selectedCityData = getCityById(cityId);
  const currentCategoryFields = categoryFields[`${categoryId}:${subcategoryId}`] || categoryFields[categoryId] || [];
  const CategoryIcon = categoryId ? categoryIcons[categoryId] : null;
  const isCarListing = categoryId === "vehicules" && subcategoryId === "voitures";
  const noPriceLabel = isCarListing ? "Sur demande" : "Gratuit";

  const isPhoneFormatValid = (p: string) => /^\d{8}$/.test(p);

  // Calculate form progress
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        showError("Seules les images sont acceptees.", "Format invalide");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        showError("Fichier trop volumineux (max 5 Mo).", "Fichier trop grand");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryDetailChange = (field: string, value: string | string[]) => {
    setCategoryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiselectToggle = (field: string, option: string) => {
    const current = (categoryDetails[field] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    handleCategoryDetailChange(field, updated);
  };

  const handleListingTypeSelect = (typeId: string) => {
    const type = listingTypes.find((item) => item.id === typeId);
    if (!type) return;

    setListingType(type.id);
    setCategoryId(type.categoryId);
    setSubcategoryId(type.subcategoryId);
    setCategoryDetails({});
  };

  const validateStep0 = () => {
    if (!listingType) {
      showError("Choisissez le type d'annonce.", "Champ requis");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!categoryId) {
      showError("Selectionnez une categorie.", "Champ requis");
      return false;
    }
    if (!subcategoryId) {
      showError("Selectionnez une sous-categorie.", "Champ requis");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!title.trim()) {
      showError("Entrez un titre pour votre annonce.", "Titre requis");
      return false;
    }
    if (!description.trim()) {
      showError("Decrivez votre article ou service.", "Description requise");
      return false;
    }
    // Validate required category fields
    for (const field of currentCategoryFields) {
      if (field.required && !categoryDetails[field.label]) {
        showError(`Veuillez remplir le champ "${field.label}".`, "Information manquante");
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (!cityId) {
      showError("Selectionnez votre ville.", "Ville requise");
      return false;
    }
    if (!phone || !isPhoneFormatValid(phone)) {
      showError("Le numero doit contenir 8 chiffres.", "Telephone invalide");
      return false;
    }
    if (phoneValid === false) {
      showError("Ce numero de telephone semble invalide.", "Verification echouee");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep0()) setStep(2);
    else if (step === 2 && validateStep1()) setStep(3);
    else if (step === 3 && validateStep2()) setStep(4);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setSubmitting(true);
    try {
      const finalPrice = priceType === "free" ? 0 : parseInt(price) || 0;
      
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
          price: finalPrice,
          phone: `+235${phone}`,
          status: "published",
          attributes: {
            listingType,
            priceType,
            categoryDetails,
          },
        })
        .select("id")
        .single();

      if (listingError) throw listingError;

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
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          const uploadData = await res.json();
          if (!res.ok || !uploadData.url) continue;

          await supabase.from("listing_images").insert({
            listing_id: listing.id,
            image_url: uploadData.url,
            position: i,
          });
        } catch {
          continue;
        }
      }

      // Fire-and-forget spam/duplicate flagging
      supabase.functions.invoke("flagSuspiciousListing", {
        body: { listing_id: listing.id },
      }).catch(() => {});

      success("Annonce publiee !", "Votre annonce est maintenant visible.");
      navigate(`/annonce/${listing.id}`);
    } catch (err: any) {
      // Use smart error parsing for technical errors
      showError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          {step > 1 ? (
            <button onClick={prevStep}>
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          ) : (
            <Link to="/">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold">Publier une annonce</h1>
            <p className="text-xs text-muted-foreground">Etape {step} sur {totalSteps}</p>
          </div>
          {CategoryIcon && (
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", selectedCategory?.bgColor)}>
              <CategoryIcon className={cn("h-5 w-5", selectedCategory?.color)} />
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          
	          {/* Step 1: Listing Type */}
	          {step === 1 && (
	            <div className="space-y-5 animate-in fade-in duration-300">
	              <div className="text-center py-4">
	                <h2 className="text-xl font-bold mb-1">Quel type d'annonce ?</h2>
	                <p className="text-sm text-muted-foreground">Le formulaire s'adapte ensuite aux informations utiles</p>
	              </div>

	              <div className="grid gap-3 sm:grid-cols-2">
	                {listingTypes.map((type) => {
	                  const Icon = type.icon;
	                  const isSelected = listingType === type.id;

	                  return (
	                    <button
	                      key={type.id}
	                      type="button"
	                      onClick={() => handleListingTypeSelect(type.id)}
	                      className={cn(
	                        "flex min-h-[132px] flex-col items-start gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all",
	                        isSelected
	                          ? "border-primary bg-primary/5 shadow-md"
	                          : "border-border hover:border-primary/50"
	                      )}
	                    >
	                      <div className="flex w-full items-start gap-3">
	                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", type.accent)}>
	                          <Icon className="h-5 w-5" />
	                        </div>
	                        <div className="min-w-0">
	                          <h3 className="font-bold text-foreground">{type.title}</h3>
	                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{type.description}</p>
	                        </div>
	                      </div>
	                      <div className="flex flex-wrap gap-1.5">
	                        {type.examples.map((example) => (
	                          <span key={example} className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
	                            {example}
	                          </span>
	                        ))}
	                      </div>
	                    </button>
	                  );
	                })}
	              </div>

	              <Button
	                type="button"
	                onClick={nextStep}
	                disabled={!listingType}
	                className="w-full h-12 font-bold text-base rounded-xl"
	              >
	                Continuer
	              </Button>
	            </div>
	          )}

	          {/* Step 2: Category Selection */}
	          {step === 2 && (
	            <div className="space-y-5 animate-in fade-in duration-300">
	              <div className="text-center py-4">
	                <h2 className="text-xl font-bold mb-1">Categorie de l'annonce</h2>
	                <p className="text-sm text-muted-foreground">
	                  {selectedListingType
	                    ? `Basee sur : ${selectedListingType.title}`
	                    : "Choisissez la categorie qui correspond le mieux"}
	                </p>
	              </div>

	              {/* Category Grid */}
	              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.id];
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
	                      onClick={() => { setCategoryId(cat.id); setSubcategoryId(""); setCategoryDetails({}); }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", cat.bgColor)}>
                        <Icon className={cn("h-6 w-6", cat.color)} />
                      </div>
	                      <span className="text-sm font-semibold text-center">{cat.name}</span>
	                    </button>
	                  );
	                })}
              </div>

              {/* Subcategory */}
              {selectedCategory && (
                <div className="space-y-2 animate-in slide-in-from-bottom duration-300">
                  <Label className="font-semibold">Sous-categorie *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCategory.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSubcategoryId(sub.id)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border",
                          subcategoryId === sub.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

	              <div className="flex gap-3">
	                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 rounded-xl">
	                  Retour
	                </Button>
	                <Button
	                  type="button"
	                  onClick={nextStep}
	                  disabled={!categoryId || !subcategoryId}
	                  className="flex-1 h-12 font-bold text-base rounded-xl"
	                >
	                  Continuer
	                </Button>
	              </div>
	            </div>
	          )}

	          {/* Step 3: Details */}
	          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center py-2">
                <h2 className="text-xl font-bold mb-1">Details de l&apos;annonce</h2>
                <p className="text-sm text-muted-foreground">Plus d&apos;infos = plus de vues</p>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  Photos (jusqu&apos;a {MAX_PHOTOS})
                  <span className="text-xs text-muted-foreground font-normal">(La premiere sera la photo principale)</span>
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border">
                      <img src={src} alt={`Aperçu de la photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5 font-bold">
                          PRINCIPALE
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors"
                        aria-label={`Supprimer la photo ${i + 1}`}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center text-primary bg-primary/5 hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Ajouter une photo"
                    >
                      <ImagePlus className="h-6 w-6" aria-hidden="true" />
                      <span className="text-[10px] mt-1 font-medium">Ajouter</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Titre *</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
	                  placeholder={
	                    categoryId === "immobilier"
	                      ? "Ex: Maison 4 chambres a louer - Chagoua"
	                      : categoryId === "emploi"
	                        ? "Ex: Comptable experimente disponible"
	                        : categoryId === "services"
	                          ? "Ex: Electricien disponible a N'Djamena"
	                          : "Ex: Toyota Hilux 2020 - Excellent etat"
	                  } 
                  maxLength={100} 
                  className="rounded-xl h-12" 
                />
                <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
              </div>

              {/* Category-specific fields */}
              {currentCategoryFields.length > 0 && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    Informations specifiques - {selectedCategory?.name}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {currentCategoryFields.map((field) => (
                      <div key={field.label} className={cn("space-y-1.5", field.type === "multiselect" && "col-span-2")}>
                        <Label className="text-sm">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        
                        {field.type === "select" && field.options && (
                          <Select 
                            value={categoryDetails[field.label] as string || ""} 
                            onValueChange={(v) => handleCategoryDetailChange(field.label, v)}
                          >
                            <SelectTrigger className="rounded-xl h-10">
                              <SelectValue placeholder="Choisir" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {field.type === "text" && (
                          <Input
                            value={categoryDetails[field.label] as string || ""}
                            onChange={(e) => handleCategoryDetailChange(field.label, e.target.value)}
                            placeholder={field.placeholder}
                            className="rounded-xl h-10"
                          />
                        )}
                        
                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={categoryDetails[field.label] as string || ""}
                            onChange={(e) => handleCategoryDetailChange(field.label, e.target.value)}
                            placeholder={field.placeholder}
                            className="rounded-xl h-10"
                          />
                        )}
                        
                        {field.type === "multiselect" && field.options && (
                          <div className="flex flex-wrap gap-2">
                            {field.options.map((opt) => {
                              const isChecked = ((categoryDetails[field.label] as string[]) || []).includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleMultiselectToggle(field.label, opt)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                    isChecked
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-card border-border hover:border-primary/50"
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Description *</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Decrivez votre article en detail: etat, caracteristiques, raison de la vente..." 
                  rows={5} 
                  maxLength={2000} 
                  className="rounded-xl" 
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <Label className="font-semibold">Prix</Label>
                <RadioGroup value={priceType} onValueChange={(v) => setPriceType(v as any)} className="flex gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="font-normal cursor-pointer">Prix fixe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negotiable" id="negotiable" />
                    <Label htmlFor="negotiable" className="font-normal cursor-pointer">Negociable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="font-normal cursor-pointer">{noPriceLabel}</Label>
                  </div>
                </RadioGroup>
                
                {priceType !== "free" && (
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="0" 
                      min={0} 
                      className="rounded-xl h-12 flex-1" 
                    />
                    <span className="text-sm font-semibold text-muted-foreground bg-muted px-4 py-3 rounded-xl">FCFA</span>
                  </div>
                )}
              </div>

              {/* Live quality indicator */}
	              <QualityIndicator
                variant="detailed"
                input={{
                  title,
                  description,
                  price: priceType === "free" ? 0 : parseInt(price) || 0,
                  imageCount: photos.length,
                }}
	              />

	              {(title || selectedCategory || previews[0]) && (
	                <div className="rounded-2xl border bg-card p-3">
	                  <div className="mb-3 flex items-center justify-between">
	                    <h3 className="text-sm font-semibold">Apercu compact</h3>
	                    <span className="text-[10px] font-medium text-muted-foreground">Avant publication</span>
	                  </div>
	                  <div className="flex gap-3">
	                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
	                      {previews[0] ? (
	                        <img src={previews[0]} alt="" className="h-full w-full object-cover" />
	                      ) : (
	                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
	                          <ImagePlus className="h-5 w-5" />
	                        </div>
	                      )}
	                    </div>
	                    <div className="min-w-0 flex-1">
	                      <p className="line-clamp-2 text-sm font-bold text-foreground">
	                        {title || "Titre de votre annonce"}
	                      </p>
	                      <p className="mt-1 text-sm font-extrabold text-primary">
	                        {priceType === "free" ? noPriceLabel : `${parseInt(price) || 0} FCFA`}
	                        {priceType === "negotiable" && " (Neg.)"}
	                      </p>
	                      <p className="mt-1 truncate text-xs text-muted-foreground">
	                        {selectedCategory?.name}
	                        {subcategoryId ? ` - ${selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.name}` : ""}
	                      </p>
	                    </div>
	                  </div>
	                </div>
	              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 rounded-xl">
                  Retour
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-12 font-bold rounded-xl">
                  Continuer
                </Button>
              </div>
            </div>
          )}

	          {/* Step 4: Location & Contact */}
	          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center py-2">
                <h2 className="text-xl font-bold mb-1">Localisation & Contact</h2>
                <p className="text-sm text-muted-foreground">Ou se trouve votre article ?</p>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Ville *</Label>
                <Select value={cityId} onValueChange={(v) => { setCityId(v); setQuartierId(""); }}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quartier */}
              {selectedCityData?.quartiers && (
                <div className="space-y-1.5">
                  <Label className="font-semibold">Quartier</Label>
                  <Select value={quartierId} onValueChange={setQuartierId}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Selectionner un quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCityData.quartiers.map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Telephone *</Label>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-semibold text-muted-foreground bg-muted px-4 py-3 rounded-xl">+235</span>
                  <div className="relative flex-1">
                    <Input
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 8)); resetValidation(); }}
                      onBlur={() => { if (phone.length === 8) validatePhone(phone); }}
                      placeholder="66 XX XX XX"
                      maxLength={8}
                      className="rounded-xl h-12 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <PhoneValidationIndicator phoneValid={phoneValid} validating={validating} />
                    </div>
                  </div>
                </div>
                {phoneValid === false && <p className="text-xs text-destructive mt-1">Numero de telephone invalide</p>}
              </div>

              {/* Final quality score */}
              <QualityIndicator
                variant="detailed"
                input={{
                  title,
                  description,
                  price: priceType === "free" ? 0 : parseInt(price) || 0,
                  quartier: quartierId || null,
                  phone: phone.length === 8 ? `+235${phone}` : "",
                  imageCount: photos.length,
                }}
              />

              {/* Summary */}
              <div className="p-4 bg-muted/30 rounded-2xl border space-y-3">
                <h3 className="font-semibold text-sm">Resume de votre annonce</h3>
                <div className="space-y-2 text-sm">
	                  <div className="flex justify-between">
	                    <span className="text-muted-foreground">Type</span>
	                    <span className="font-medium">{selectedListingType?.title}</span>
	                  </div>
	                  <div className="flex justify-between">
	                    <span className="text-muted-foreground">Categorie</span>
	                    <span className="font-medium">{selectedCategory?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Titre</span>
                    <span className="font-medium truncate max-w-[200px]">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-medium">
                      {priceType === "free" ? noPriceLabel : `${parseInt(price) || 0} FCFA`}
                      {priceType === "negotiable" && " (Neg.)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Photos</span>
                    <span className="font-medium">{photos.length} photo(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 rounded-xl">
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-bold text-base rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Publication...
                    </>
                  ) : (
                    "Publier"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishListing;
