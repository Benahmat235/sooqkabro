import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Share2 } from "lucide-react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockListings, formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import { getCategoryById, getSubcategoryName } from "@/data/categories";
import { useState } from "react";

const ListingDetail = () => {
  const { id } = useParams();
  const [selectedCity, setSelectedCity] = useState("all");

  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl font-bold">Annonce introuvable</p>
          <Link to="/" className="text-primary underline mt-2 inline-block">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const city = getCityById(listing.cityId);
  const category = getCategoryById(listing.categoryId);
  const subcategoryName = getSubcategoryName(listing.categoryId, listing.subcategoryId);
  const phoneFormatted = `+235 ${listing.phone.slice(0, 2)} ${listing.phone.slice(2, 4)} ${listing.phone.slice(4, 6)} ${listing.phone.slice(6)}`;
  const whatsappLink = `https://wa.me/235${listing.phone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${listing.title}" sur TchadMarket.`)}`;
  const callLink = `tel:+235${listing.phone}`;

  const similarListings = mockListings
    .filter((l) => l.categoryId === listing.categoryId && l.id !== listing.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <span>/</span>
          <Link to={`/categorie/${listing.categoryId}`} className="hover:text-primary">
            {category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{subcategoryName}</span>
        </div>

        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-muted aspect-video mb-4">
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="bg-card rounded-xl border p-4 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {listing.title}
            </h1>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-2xl font-extrabold text-primary mb-3">
            {formatPrice(listing.price)}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {city?.name}{listing.quartier ? `, ${listing.quartier}` : ""}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {listing.createdAt}
            </Badge>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {listing.description}
          </p>

          <div className="text-sm text-muted-foreground mb-4">
            <strong>Téléphone :</strong> {phoneFormatted}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <a href={callLink} className="flex-1">
              <Button className="w-full gap-2 bg-primary text-primary-foreground h-12 font-bold">
                <Phone className="h-5 w-5" />
                Appeler
              </Button>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white h-12 font-bold">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Similar */}
        {similarListings.length > 0 && (
          <section className="py-4">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Annonces similaires
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {similarListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ListingDetail;
