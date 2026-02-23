export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId: string;
  cityId: string;
  quartier?: string;
  phone: string;
  images: string[];
  createdAt: string;
  featured?: boolean;
}

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Toyota Hilux 2019 - Excellent état",
    description: "Toyota Hilux double cabine, diesel, 4x4, climatisation, 85 000 km. Véhicule très bien entretenu, première main. Idéal pour la ville et les pistes.",
    price: 18500000,
    categoryId: "vehicules",
    subcategoryId: "voitures",
    cityId: "ndjamena",
    quartier: "Moursal",
    phone: "66123456",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-22",
    featured: true,
  },
  {
    id: "2",
    title: "Maison 4 chambres à louer - Chagoua",
    description: "Belle maison clôturée avec 4 chambres, salon, cuisine moderne, 2 douches, garage. Quartier calme, proche du goudron.",
    price: 250000,
    categoryId: "immobilier",
    subcategoryId: "maisons-louer",
    cityId: "ndjamena",
    quartier: "Chagoua",
    phone: "99887766",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-21",
    featured: true,
  },
  {
    id: "3",
    title: "iPhone 14 Pro Max 256 Go",
    description: "iPhone 14 Pro Max en parfait état, 256 Go, couleur noir, avec chargeur et coque. Acheté à Dubaï.",
    price: 550000,
    categoryId: "telephones",
    subcategoryId: "iphone",
    cityId: "ndjamena",
    quartier: "Dembé",
    phone: "66554433",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-20",
    featured: true,
  },
  {
    id: "4",
    title: "Tecno Spark 20 Pro neuf",
    description: "Tecno Spark 20 Pro, neuf sous emballage, 256 Go, double SIM. Garantie 6 mois.",
    price: 120000,
    categoryId: "telephones",
    subcategoryId: "tecno",
    cityId: "moundou",
    phone: "66112233",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-19",
  },
  {
    id: "5",
    title: "Terrain 500m² à vendre - Gassi",
    description: "Terrain titré de 500m² bien situé à Gassi, proche de la route principale. Idéal pour construction de villa ou commerce.",
    price: 15000000,
    categoryId: "immobilier",
    subcategoryId: "terrains",
    cityId: "ndjamena",
    quartier: "Gassi",
    phone: "99001122",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-20",
  },
  {
    id: "6",
    title: "Moto Jakarta 110cc",
    description: "Moto Jakarta en bon état, peu utilisée, documents à jour. Idéale pour les déplacements en ville.",
    price: 350000,
    categoryId: "vehicules",
    subcategoryId: "motos",
    cityId: "sarh",
    phone: "66778899",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-18",
  },
  {
    id: "7",
    title: "Recherche comptable expérimenté",
    description: "Cabinet comptable recherche un comptable avec 3 ans d'expérience minimum. Maîtrise de SAGE requise. Salaire motivant.",
    price: 0,
    categoryId: "emploi",
    subcategoryId: "offres-emploi",
    cityId: "ndjamena",
    quartier: "Moursal",
    phone: "66334455",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-21",
  },
  {
    id: "8",
    title: "Salon complet en cuir - 7 places",
    description: "Salon en cuir véritable, 7 places, très bon état. Couleur marron. Possibilité de livraison dans N'Djaména.",
    price: 450000,
    categoryId: "maison",
    subcategoryId: "meubles-salon",
    cityId: "ndjamena",
    quartier: "Amtoukoui",
    phone: "99556677",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-17",
  },
  {
    id: "9",
    title: "Moutons pour Tabaski - lot de 5",
    description: "5 beaux moutons bien engraissés, race locale. Prix négociable pour le lot. Livraison possible à N'Djaména.",
    price: 250000,
    categoryId: "animaux",
    subcategoryId: "betail",
    cityId: "bongor",
    phone: "66998877",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-16",
  },
  {
    id: "10",
    title: "Tissus wax hollandais - 6 yards",
    description: "Wax hollandais original, nouveaux motifs, 6 yards. Plusieurs modèles disponibles. Vente en gros possible.",
    price: 25000,
    categoryId: "mode",
    subcategoryId: "tissus",
    cityId: "ndjamena",
    quartier: "Dembé",
    phone: "66445566",
    images: ["/placeholder.svg"],
    createdAt: "2026-02-19",
  },
];

export function formatPrice(price: number): string {
  if (price === 0) return "Gratuit";
  return price.toLocaleString("fr-FR") + " FCFA";
}
