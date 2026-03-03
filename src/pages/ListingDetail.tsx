import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Clock, Share2, Heart, ChevronLeft, ChevronRight as ChevronRightIcon, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import { getCategoryById, getSubcategoryName } from "@/data/categories";
import { useListings } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ListingDetail = () => {
  const { id } = useParams();
  const { data: allListings = [], isLoading } = useListings();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const listing = allListings.find((l) => l.id === id);
  const isFav = listing ? favoriteIds.includes(listing.id) : false;
  const images = listing && listing.images.length > 0 ? listing.images : ["/placeholder.svg"];

  const nextImg = useCallback(() => setCurrentImg((p) => (p + 1) % images.length), [images.length]);
  const prevImg = useCallback(() => setCurrentImg((p) => (p - 1 + images.length) % images.length), [images.length]);

  // Reset image index when listing changes
  useEffect(() => { setCurrentImg(0); }, [id]);

  // Fetch seller's verified WhatsApp phone via secure RPC
  useEffect(() => {
    if (!listing?.user_id) return;
    supabase.rpc("get_seller_phone", { _user_id: listing.user_id })
      .then(({ data }) => { if (data) setSellerPhone(data); });
  }, [listing?.user_id]);

  // Track view (deduplicated for logged-in users via unique index)
  useEffect(() => {
    if (!id) return;
    const viewerId = user?.id || null;
    if (viewerId) {
      // Use upsert with unique constraint to avoid duplicates
      supabase.from("listing_views").upsert(
        { listing_id: id, viewer_id: viewerId },
        { onConflict: "listing_id,viewer_id" }
      ).then(() => {});
    } else {
      supabase.from("listing_views").insert({
        listing_id: id,
        viewer_id: null,
      }).then(() => {});
    }
  }, [id, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-32 h-8 rounded" />
      </div>
    );
  }

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

  const city = getCityById(listing.city_id);
  const category = getCategoryById(listing.category_id);
  const subcategoryName = getSubcategoryName(listing.category_id, listing.subcategory_id);
  const cleanPhone = listing.phone.replace(/\D/g, "");
  const whatsappPhone = (sellerPhone || listing.phone).replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${listing.title}" sur TchadMarket.`)}`;
  const callLink = `tel:+${cleanPhone}`;
  const phoneFormatted = cleanPhone.length >= 11
    ? `+${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7, 9)} ${cleanPhone.slice(9)}`
    : listing.phone;
  const listingUrl = `${window.location.origin}/annonce/${listing.id}`;
  const shareText = `${listing.title} - ${formatPrice(listing.price)}\n📍 ${city?.name || ""}\n👉 ${listingUrl}`;
  const shareWhatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const similarListings = allListings
    .filter((l) => l.category_id === listing.category_id && l.id !== listing.id)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fullscreen gallery */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10 bg-white/20 rounded-full p-2">
            <X className="h-6 w-6 text-white" />
          </button>
          <div
            className="flex-1 flex items-center justify-center relative"
            onTouchStart={(e) => {
              (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any)._touchStartX;
              if (startX === undefined) return;
              const diff = startX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) nextImg();
                else prevImg();
              }
              delete (e.currentTarget as any)._touchStartX;
            }}
          >
            {images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-2 bg-white/20 rounded-full p-2 z-10"><ChevronLeft className="h-6 w-6 text-white" /></button>
                <button onClick={nextImg} className="absolute right-2 bg-white/20 rounded-full p-2 z-10"><ChevronRightIcon className="h-6 w-6 text-white" /></button>
              </>
            )}
            <img src={images[currentImg]} alt={listing.title} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="py-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={`w-2.5 h-2.5 rounded-full ${i === currentImg ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div
          className="aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
          onClick={() => setFullscreen(true)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            (e.currentTarget as any)._touchStartX = touch.clientX;
          }}
          onTouchEnd={(e) => {
            const startX = (e.currentTarget as any)._touchStartX;
            if (startX === undefined) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
              if (diff > 0) nextImg();
              else prevImg();
            }
            delete (e.currentTarget as any)._touchStartX;
          }}
        >
          <img src={images[currentImg]} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/70 backdrop-blur-sm rounded-full p-1.5 shadow"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/70 backdrop-blur-sm rounded-full p-1.5 shadow"><ChevronRightIcon className="h-5 w-5 text-foreground" /></button>
          </>
        )}
        <Link to="/" className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div className="absolute bottom-3 right-3 bg-foreground/70 text-card text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          📷 {images.length}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className={`w-2 h-2 rounded-full ${i === currentImg ? 'bg-card' : 'bg-card/50'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-extrabold text-primary">{formatPrice(listing.price)}</h2>
        </div>
        <div className="border-b mb-3" />
        <h1 className="text-lg font-bold mb-1">{listing.title}</h1>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <span>{category?.name}</span><span>›</span><span>{subcategoryName}</span>
        </div>
        <div className="border-b mb-3" />
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {city?.name}{listing.quartier ? `, ${listing.quartier}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {listing.created_at?.slice(0, 10)}
          </span>
        </div>
        <div className="border-b mb-3" />
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{listing.description}</p>
        <div className="text-sm text-muted-foreground mb-5">
          <strong>📞</strong> {phoneFormatted}
        </div>
        <div className="space-y-2.5 mb-4">
          <a href={callLink} className="block">
            <Button className="w-full gap-2 bg-primary text-primary-foreground h-13 font-bold text-base rounded-xl">
              <Phone className="h-5 w-5" />{phoneFormatted}
            </Button>
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full gap-2 h-13 font-bold text-base rounded-xl border-2">
              <MessageCircle className="h-5 w-5" />WhatsApp
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <a href={shareWhatsappLink} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="gap-2 rounded-xl h-11 w-full"><Share2 className="h-4 w-4" />Partager</Button></a>
          <Button
            variant="outline"
            className={cn("gap-2 rounded-xl h-11", isFav && "border-destructive text-destructive")}
            onClick={() => toggleFav.mutate({ listingId: listing.id, isFav })}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-destructive")} />
            {isFav ? "Sauvegardé" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Safety tips */}
      <div className="px-4 pb-4">
        <div className="bg-accent/50 border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">🛡️ Conseils de sécurité</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Ne payez jamais à l'avance avant d'avoir vu l'article</li>
            <li>Rencontrez le vendeur dans un lieu public et fréquenté</li>
            <li>Vérifiez l'article avant de payer</li>
            <li>Méfiez-vous des prix anormalement bas</li>
            <li>Ne partagez jamais vos informations bancaires</li>
          </ul>
        </div>
      </div>

      {similarListings.length > 0 && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Annonces similaires</h2>
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
