import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Share2, Heart, ChevronLeft, ChevronRight as ChevronRightIcon, X, BadgeCheck, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ContactActions from "@/components/ContactActions";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/data/mockListings";
import { getCityById } from "@/data/cities";
import { getCategoryById, getSubcategoryName } from "@/data/categories";
import { useListings } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useSellerReviews, useSellerRating, useSubmitReview } from "@/hooks/useSellerReviews";
import { useStartConversation } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: allListings = [], isLoading } = useListings();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const listing = allListings.find((l) => l.id === id);
  const isFav = listing ? favoriteIds.includes(listing.id) : false;
  const images = listing && listing.images.length > 0 ? listing.images : ["/placeholder.svg"];

  const { data: reviews = [] } = useSellerReviews(listing?.user_id);
  const { avg: sellerAvg, count: reviewCount } = useSellerRating(listing?.user_id);
  const submitReview = useSubmitReview();
  const startConversation = useStartConversation();

  const nextImg = useCallback(() => setCurrentImg((p) => (p + 1) % images.length), [images.length]);
  const prevImg = useCallback(() => setCurrentImg((p) => (p - 1 + images.length) % images.length), [images.length]);

  useEffect(() => { setCurrentImg(0); }, [id]);

  useEffect(() => {
    if (!listing?.user_id) return;
    supabase.rpc("get_seller_phone", { _user_id: listing.user_id })
      .then(({ data }) => { if (data) setSellerPhone(data); });
    supabase.from("profiles").select("display_name, avatar_url, is_verified, created_at")
      .eq("id", listing.user_id).maybeSingle()
      .then(({ data }) => { if (data) setSellerProfile(data); });
  }, [listing?.user_id]);

  useEffect(() => {
    if (!id) return;
    const viewerId = user?.id || null;
    if (viewerId) {
      supabase.from("listing_views").upsert(
        { listing_id: id, viewer_id: viewerId },
        { onConflict: "listing_id,viewer_id" }
      ).then(() => {});
    } else {
      supabase.from("listing_views").insert({ listing_id: id, viewer_id: null }).then(() => {});
    }
  }, [id, user?.id]);

  const handleStartChat = async () => {
    if (!user || !listing) return;
    if (user.id === listing.user_id) return;
    try {
      const convoId = await startConversation.mutateAsync({
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.user_id,
      });
      navigate("/messages");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = () => {
    if (!user || !listing) return;
    submitReview.mutate({
      sellerId: listing.user_id,
      reviewerId: user.id,
      rating: reviewRating,
      comment: reviewComment,
    });
    setShowReviewForm(false);
    setReviewComment("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <p className="text-xl font-extrabold text-foreground">Annonce introuvable</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block hover:underline">← Retour à l'accueil</Link>
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
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: fr });

  const similarListings = allListings
    .filter((l) => l.category_id === listing.category_id && l.id !== listing.id)
    .slice(0, 6);

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Fullscreen gallery */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-foreground flex flex-col animate-fade-in">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10 bg-card/20 rounded-full p-2.5 backdrop-blur-sm">
            <X className="h-6 w-6 text-card" />
          </button>
          <div
            className="flex-1 flex items-center justify-center relative"
            onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any)._touchStartX;
              if (startX === undefined) return;
              const diff = startX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) { diff > 0 ? nextImg() : prevImg(); }
              delete (e.currentTarget as any)._touchStartX;
            }}
          >
            {images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 bg-card/20 backdrop-blur-sm rounded-full p-2.5 z-10"><ChevronLeft className="h-6 w-6 text-card" /></button>
                <button onClick={nextImg} className="absolute right-3 bg-card/20 backdrop-blur-sm rounded-full p-2.5 z-10"><ChevronRightIcon className="h-6 w-6 text-card" /></button>
              </>
            )}
            <img src={images[currentImg]} alt={listing.title} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="py-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={cn("w-2.5 h-2.5 rounded-full transition-all", i === currentImg ? 'bg-card scale-125' : 'bg-card/40')} />
            ))}
          </div>
        </div>
      )}

      {/* Image carousel */}
      <div className="relative">
        <div
          className="aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
          onClick={() => setFullscreen(true)}
          onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const startX = (e.currentTarget as any)._touchStartX;
            if (startX === undefined) return;
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) { diff > 0 ? nextImg() : prevImg(); }
            delete (e.currentTarget as any)._touchStartX;
          }}
        >
          <img src={images[currentImg]} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg active:scale-90 transition-transform"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg active:scale-90 transition-transform"><ChevronRightIcon className="h-5 w-5 text-foreground" /></button>
          </>
        )}
        <Link to="/" className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-full p-2.5 shadow-lg active:scale-90 transition-transform">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div className="absolute bottom-3 right-3 bg-foreground/70 text-card text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
          📷 {currentImg + 1}/{images.length}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className={cn("w-2 h-2 rounded-full transition-all", i === currentImg ? 'bg-card scale-125' : 'bg-card/50')} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-5 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-primary mb-1">{formatPrice(listing.price)}</h2>
        <h1 className="text-lg font-bold text-foreground mb-2">{listing.title}</h1>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{category?.name}</span>
          <span className="text-border">›</span>
          <span>{subcategoryName}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-chad-yellow" />
            {city?.name}{listing.quartier ? `, ${listing.quartier}` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {timeAgo}
          </span>
        </div>

        <div className="border-t border-border/50 my-4" />
        
        <p className="text-sm text-foreground/80 leading-relaxed mb-6">{listing.description}</p>

        {/* Seller profile card */}
        {sellerProfile && (
          <div className="bg-card border rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <img
                src={sellerProfile.avatar_url || "/placeholder.svg"}
                alt=""
                className="w-12 h-12 rounded-full object-cover bg-muted"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">{sellerProfile.display_name || "Vendeur"}</span>
                  {sellerProfile.is_verified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {reviewCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-chad-yellow text-chad-yellow" />
                      {sellerAvg} ({reviewCount})
                    </span>
                  )}
                  <span>Membre {formatDistanceToNow(new Date(sellerProfile.created_at), { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact actions are now in sticky bottom bar */}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <a href={shareWhatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 rounded-2xl h-11 w-full text-sm">
              <Share2 className="h-4 w-4" />Partager
            </Button>
          </a>
          <Button
            variant="outline"
            className={cn("gap-2 rounded-2xl h-11", isFav && "border-chad-red text-chad-red")}
            onClick={() => toggleFav.mutate({ listingId: listing.id, isFav })}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-chad-red")} />
            {isFav ? "Sauvegardé" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Seller reviews section */}
      <div className="px-4 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-foreground">Avis sur le vendeur</h2>
          {user && !isOwner && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {showReviewForm ? "Annuler" : "Donner un avis"}
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="bg-card border rounded-2xl p-4 mb-3 animate-fade-in">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setReviewRating(s)}>
                  <Star className={cn("h-6 w-6 transition-colors", s <= reviewRating ? "fill-chad-yellow text-chad-yellow" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Votre commentaire (optionnel)..."
              rows={2}
              className="rounded-xl mb-2"
              maxLength={500}
            />
            <Button onClick={handleSubmitReview} size="sm" className="rounded-xl" disabled={submitReview.isPending}>
              Publier l'avis
            </Button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun avis pour ce vendeur</p>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-card border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <img src={r.reviewer_avatar || "/placeholder.svg"} alt="" className="w-6 h-6 rounded-full object-cover bg-muted" />
                  <span className="text-xs font-bold text-foreground">{r.reviewer_name}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-2.5 w-2.5", i < r.rating ? "fill-chad-yellow text-chad-yellow" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety tips */}
      <div className="px-4 pb-5">
        <div className="bg-accent/50 border border-accent rounded-2xl p-4">
          <h3 className="font-extrabold text-sm mb-2.5 flex items-center gap-2">🛡️ Conseils de sécurité</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Ne payez jamais à l'avance avant d'avoir vu l'article</li>
            <li>Rencontrez le vendeur dans un lieu public</li>
            <li>Vérifiez l'article avant de payer</li>
            <li>Méfiez-vous des prix anormalement bas</li>
          </ul>
        </div>
      </div>

      {similarListings.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-lg font-extrabold text-foreground mb-3">Annonces similaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {similarListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom contact bar */}
      <ContactActions
        isVerified={!!sellerProfile?.is_verified}
        whatsappLink={whatsappLink}
        onChat={handleStartChat}
        isChatDisabled={startConversation.isPending}
        canChat={!!user && !isOwner}
        sellerName={sellerProfile?.display_name}
      />
    </div>
  );
};

export default ListingDetail;
