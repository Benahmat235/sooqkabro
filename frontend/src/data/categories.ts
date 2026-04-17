import {
  Car, Home, Smartphone, Briefcase, Wrench, PawPrint,
  Shirt, Sofa, Monitor, UtensilsCrossed
} from "lucide-react";

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  image: string;
  color: string;
  bgColor: string;
  subcategories: SubCategory[];
}

export const categories: Category[] = [
  {
    id: "vehicules",
    name: "Véhicules & Transports",
    icon: Car,
    image: "/categories/vehicules.jpg",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    subcategories: [
      { id: "voitures", name: "Voitures d'occasion" },
      { id: "motos", name: "Motos et cyclomoteurs" },
      { id: "camions", name: "Camions et poids lourds" },
      { id: "pieces", name: "Pièces détachées" },
      { id: "location-vehicules", name: "Location de véhicules" },
      { id: "transport", name: "Transport de marchandises" },
    ],
  },
  {
    id: "immobilier",
    name: "Immobilier",
    icon: Home,
    image: "/categories/immobilier.jpg",
    color: "text-green-600",
    bgColor: "bg-green-50",
    subcategories: [
      { id: "maisons-vente", name: "Maisons à vendre" },
      { id: "maisons-louer", name: "Maisons à louer" },
      { id: "appartements", name: "Appartements" },
      { id: "terrains", name: "Terrains et parcelles" },
      { id: "bureaux", name: "Bureaux et commerces" },
      { id: "colocation", name: "Colocation" },
    ],
  },
  {
    id: "telephones",
    name: "Téléphones & Tablettes",
    icon: Smartphone,
    image: "/categories/telephones.jpg",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    subcategories: [
      { id: "iphone", name: "iPhone" },
      { id: "samsung", name: "Samsung" },
      { id: "tecno", name: "Tecno / Infinix / Itel" },
      { id: "accessoires-tel", name: "Accessoires téléphoniques" },
      { id: "reparation", name: "Réparation téléphone" },
    ],
  },
  {
    id: "emploi",
    name: "Emploi & Formation",
    icon: Briefcase,
    image: "/categories/emploi.jpg",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    subcategories: [
      { id: "offres-emploi", name: "Offres d'emploi" },
      { id: "recherche-emploi", name: "Recherche d'emploi" },
      { id: "formation", name: "Formation professionnelle" },
      { id: "stages", name: "Stages" },
    ],
  },
  {
    id: "services",
    name: "Services",
    icon: Wrench,
    image: "/categories/services.jpg",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    subcategories: [
      { id: "telecom", name: "Télécommunications" },
      { id: "transfert-argent", name: "Transfert d'argent" },
      { id: "transport-logistique", name: "Transport et logistique" },
      { id: "construction", name: "Construction et rénovation" },
      { id: "securite", name: "Sécurité et gardiennage" },
      { id: "informatique", name: "Informatique et internet" },
      { id: "photo-video", name: "Photographie et vidéo" },
    ],
  },
  {
    id: "animaux",
    name: "Animaux & Élevage",
    icon: PawPrint,
    image: "/categories/animaux.jpg",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    subcategories: [
      { id: "chiens", name: "Chiens de garde" },
      { id: "chats", name: "Chats" },
      { id: "volailles", name: "Volailles" },
      { id: "betail", name: "Bétail" },
      { id: "aliments-animaux", name: "Aliments pour animaux" },
    ],
  },
  {
    id: "mode",
    name: "Mode & Beauté",
    icon: Shirt,
    image: "/categories/mode.jpg",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    subcategories: [
      { id: "vetements-hommes", name: "Vêtements hommes" },
      { id: "vetements-femmes", name: "Vêtements femmes" },
      { id: "vetements-enfants", name: "Vêtements enfants" },
      { id: "chaussures", name: "Chaussures" },
      { id: "tissus", name: "Tissus et wax" },
      { id: "coiffure", name: "Coiffure et beauté" },
    ],
  },
  {
    id: "maison",
    name: "Maison & Meubles",
    icon: Sofa,
    image: "/categories/maison.jpg",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    subcategories: [
      { id: "meubles-salon", name: "Meubles salon" },
      { id: "meubles-chambre", name: "Meubles chambre" },
      { id: "electromenager", name: "Électroménager" },
      { id: "decoration", name: "Décoration" },
    ],
  },
  {
    id: "electronique",
    name: "Électronique",
    icon: Monitor,
    image: "/categories/electronique.jpg",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    subcategories: [
      { id: "ordinateurs", name: "Ordinateurs et accessoires" },
      { id: "tv-audio", name: "TV et audio" },
      { id: "jeux-video", name: "Jeux vidéo" },
    ],
  },
  {
    id: "alimentation",
    name: "Alimentation",
    icon: UtensilsCrossed,
    image: "/categories/alimentation.jpg",
    color: "text-red-600",
    bgColor: "bg-red-50",
    subcategories: [
      { id: "produits-frais", name: "Produits frais" },
      { id: "epicerie", name: "Épicerie" },
      { id: "restauration", name: "Restauration" },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getSubcategoryName(categoryId: string, subId: string): string | undefined {
  const cat = getCategoryById(categoryId);
  return cat?.subcategories.find((s) => s.id === subId)?.name;
}
