import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Share2, Heart, ChevronLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { mockListings, formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import { getCategoryById, getSubcategoryName } from "@/data/categories";

const ListingDetail = () => {
  const { id } = useParams();
  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">Annonce introuvable</p>
          <Link to="/" className="text-primary underline mt-2 inline-block">Retour</Link>
        </div>
      </div>
    );
  }

  const city = getCityById(listing.cityId);
  const category = getCategoryById(listing.categoryId);
  const subcategoryName = getSubcategoryName(listing.categoryId, listing.subcategoryId);
  const whatsappLink = `https://wa.me/235${listing.phone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${listing.title}" sur TchadMarket.`)}`;
  const callLink = `tel:+235${listing.phone}`;
  const phoneFormatted = `+235 ${listing.phone.slice(0, 2)} ${listing.phone.slice(2, 4)} ${listing.phone.slice(4, 6)} ${listing.phone.slice(6)}`;

  const similarListings = mockListings
    .filter((l) => l.categoryId === listing.categoryId && l.id !== listing.id)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Full-width image */}
      <div className="relative">
        <div className="aspect-[4/3] bg-muted">
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        {/* Photo count */}
        <div className="absolute bottom-3 right-3 bg-foreground/70 text-card text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          📷 {listing.images.length}
        </div>
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {listing.images.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-card' : 'bg-card/50'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-extrabold text-primary">
            {formatPrice(listing.price)}
          </h2>
        </div>

        {/* Separator */}
        <div className="border-b mb-3" />

        {/* Title */}
        <h1 className="text-lg font-bold mb-1">
          {listing.title}
        </h1>

        {/* Category breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <span>{category?.name}</span>
          <span>›</span>
          <span>{subcategoryName}</span>
        </div>

        {/* Separator */}
        <div className="border-b mb-3" />

        {/* Details row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {city?.name}{listing.quartier ? `, ${listing.quartier}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {listing.createdAt}
          </span>
        </div>

        {/* Separator */}
        <div className="border-b mb-3" />

        {/* Description */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          {listing.description}
        </p>

        {/* Phone */}
        <div className="text-sm text-muted-foreground mb-5">
          <strong>📞</strong> {phoneFormatted}
        </div>

        {/* Action buttons - OpenSooq style */}
        <div className="space-y-2.5 mb-4">
          <a href={callLink} className="block">
            <Button className="w-full gap-2 bg-primary text-primary-foreground h-13 font-bold text-base rounded-xl">
              <Phone className="h-5 w-5" />
              {phoneFormatted}
            </Button>
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full gap-2 h-13 font-bold text-base rounded-xl border-2">
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>
          </a>
        </div>

        {/* Share / Save row */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <Button variant="outline" className="gap-2 rounded-xl h-11">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl h-11">
            <Heart className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Similar */}
      {similarListings.length > 0 && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Annonces similaires</h2>
            <span className="text-primary text-sm font-semibold">Voir tout →</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {similarListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ListingDetail;
