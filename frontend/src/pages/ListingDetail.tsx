import { useEffect, useRef, useState, useCallback, type ElementType } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
  BadgeCheck,
  Star,
  Eye,
  Hash,
  CalendarDays,
  RefreshCw,
  Tag,
  Info,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Timer,
  ListChecks,
  Flag,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ContactActions from "@/components/ContactActions";
import SimilarProducts from "@/components/SimilarProducts";
import CoViewedProducts from "@/components/CoViewedProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSkeleton } from "@/components/Skeletons";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/pricing";
import { getCityById } from "@/data/cities";
import { getCategoryById, getSubcategoryName } from "@/data/categories";
import { useListings } from "@/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useSellerReviews, useSellerRating, useSubmitReview } from "@/hooks/useSellerReviews";
import { useSellerStats } from "@/hooks/useSellerStats";
import { useStartConversation } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { pushRecentlyViewed } from "@/hooks/useRecentlyViewed";

type DetailItem = {
  label: string;
  value: string | number | string[] | null | undefined;
  icon?: ElementType;
};

type SellerProfileInfo = {
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
};

const emptyValue = "Non renseigné";

const formatDate = (date?: string) => {
  if (!date) return emptyValue;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDetailValue = (value: DetailItem["value"]) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  if (Array.isArray(value)) return value.length ? value.join(", ") : emptyValue;
  return String(value);
};

const priceTypeLabels: Record<string, string> = {
  fixed: "Prix fixe",
  negotiable: "Oui",
  free: "Sans prix",
};

const getAttributeValue = (
  details: Record<string, string | string[]>,
  labels: string[],
) => labels.map((label) => details[label]).find((value) => {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
});

const getCharacteristicValue = (
  details: Record<string, string | string[]>,
  label: string,
) => getAttributeValue(details, {
  "Modèle": ["Modèle", "Modele"],
  "Année": ["Année", "Annee"],
  "Kilométrage": ["Kilométrage", "Kilometrage (km)"],
  "État": ["État", "Etat", "Etat du vehicule"],
  "Carburant": ["Carburant"],
  "Boîte": ["Boîte", "Transmission / vitesse"],
  "Couleur": ["Couleur", "Couleur exterieure"],
  "Papiers": ["Papiers", "Documents disponibles"],
  "Stockage": ["Stockage", "Capacite stockage"],
  "RAM": ["RAM", "Memoire RAM"],
  "État batterie": ["État batterie", "Batterie"],
  "Accessoires": ["Accessoires", "Accessoires inclus", "Options"],
  "Garantie": ["Garantie"],
  "Surface": ["Surface", "Surface (m2)"],
  "Chambres": ["Chambres", "Nombre de chambres"],
  "Salons": ["Salons"],
  "Toilettes": ["Toilettes", "Nombre de salles de bain"],
  "Meublé": ["Meublé", "Meuble"],
  "Eau / électricité": ["Eau / électricité", "Eau courante"],
  "Type de contrat": ["Type de contrat", "Type d'offre"],
  "Expérience": ["Expérience", "Experience", "Experience requise"],
  "Disponibilité": ["Disponibilité", "Disponibilite", "Disponibilite pour visite"],
  "Tarif": ["Tarif", "Type de service"],
  "Zone couverte": ["Zone couverte", "Zone d'intervention"],
  "Type": ["Type", "Type de bien", "Type de service", "Type d'animal", "Type de meuble"],
  "Race": ["Race"],
  "Âge": ["Âge", "Age"],
  "Sexe": ["Sexe"],
  "Vacciné": ["Vacciné", "Vaccine"],
  "Quantité": ["Quantité", "Quantite disponible"],
  "Taille": ["Taille"],
  "Matière": ["Matière", "Matiere", "Materiau"],
  "Dimensions": ["Dimensions"],
  "Origine": ["Origine"],
  "Date limite": ["Date limite"],
  "Conditionnement": ["Conditionnement", "Conservation"],
  "Niveau": ["Niveau", "Niveau d'etudes"],
  "Salaire": ["Salaire", "Salaire mensuel (FCFA)"],
  "Lieu de travail": ["Lieu de travail", "Localisation precise"],
}[label] || [label]);

const categoryCharacteristicLabels: Record<string, string[]> = {
  vehicules: ["Marque", "Modèle", "Année", "Kilométrage", "Carburant", "Boîte", "Couleur", "Papiers"],
  telephones: ["Marque", "Modèle", "Stockage", "RAM", "État batterie", "Accessoires", "Garantie"],
  immobilier: ["Type de bien", "Surface", "Chambres", "Salons", "Toilettes", "Meublé", "Eau / électricité"],
  emploi: ["Type de contrat", "Expérience", "Niveau", "Disponibilité", "Salaire", "Lieu de travail"],
  services: ["Type de service", "Zone couverte", "Disponibilité", "Tarif", "Expérience"],
  animaux: ["Type", "Race", "Âge", "Sexe", "Vacciné", "Quantité"],
  mode: ["Type", "Marque", "Taille", "Couleur", "État"],
  maison: ["Type", "Marque", "Matière", "Dimensions", "État"],
  electronique: ["Marque", "Modèle", "État", "Garantie", "Accessoires"],
  alimentation: ["Type", "Quantité", "Origine", "Date limite", "Conditionnement"],
};

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
  const [sellerProfile, setSellerProfile] = useState<SellerProfileInfo | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  const listing = allListings.find((l) => l.id === id);
  const isFav = listing ? favoriteIds.includes(listing.id) : false;
  const images = listing && listing.images.length > 0 ? listing.images : ["/placeholder.svg"];

  useEffect(() => {
    if (id) pushRecentlyViewed(id);
  }, [id]);

  const { data: reviews = [] } = useSellerReviews(listing?.user_id);
  const { avg: sellerAvg, count: reviewCount } = useSellerRating(listing?.user_id);
  const { data: sellerStats } = useSellerStats(listing?.user_id);
  const submitReview = useSubmitReview();
  const startConversation = useStartConversation();

  const nextImg = useCallback(() => setCurrentImg((p) => (p + 1) % images.length), [images.length]);
  const prevImg = useCallback(() => setCurrentImg((p) => (p - 1 + images.length) % images.length), [images.length]);

  const handleTouchStart = (clientX: number) => {
    touchStartX.current = clientX;
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImg();
      else prevImg();
    }
    touchStartX.current = null;
  };

  useEffect(() => { setCurrentImg(0); }, [id]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", id)
      .then(({ count }) => setFavoriteCount(count || 0));
  }, [id, isFav]);

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
    if (!listing) return;
    if (!user) { navigate("/auth"); return; }
    if (user.id === listing.user_id) return;
    try {
      await startConversation.mutateAsync({
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.user_id,
      });
      navigate("/messages");
    } catch (err) { console.error(err); }
  };

  const handleNativeShare = async () => {
    if (!listing) return;
    const city = getCityById(listing.city_id);
    const url = `${window.location.origin}/annonce/${listing.id}`;
    const text = `${listing.title} - ${formatPrice(listing.price)}\n📍 ${city?.name || ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text, url });
      } catch (error) {
        // User cancelled share or share failed - fallback to clipboard
        console.error("Share cancelled or failed:", error);
        try {
          await navigator.clipboard.writeText(url);
          toast({ title: t("detail.copied"), description: t("detail.linkCopied") });
        } catch {
          console.error("Failed to copy to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: t("detail.copied"), description: t("detail.linkCopied") });
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

  const handleReportListing = async () => {
    if (!listing) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.id === listing.user_id) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas signaler votre propre annonce.",
        variant: "destructive",
      });
      return;
    }

    setIsReporting(true);
    const { error } = await supabase.from("listing_flags").insert({
      listing_id: listing.id,
      reporter_id: user.id,
      reason: "user_report",
      details: {
        source: "listing_detail",
        listing_title: listing.title,
        seller_id: listing.user_id,
      },
    });
    setIsReporting(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Déjà signalé",
          description: "Votre signalement pour cette annonce a déjà été pris en compte.",
        });
        return;
      }
      toast({
        title: "Erreur",
        description: "Le signalement n'a pas pu être envoyé.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Annonce signalée",
      description: "Merci, notre équipe va examiner ce produit.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <ProfileSkeleton className="mt-6" />
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
          <p className="text-xl font-extrabold text-foreground">{t("listings.notFound")}</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block hover:underline">{t("listings.backHome")}</Link>
        </div>
      </div>
    );
  }

  const city = getCityById(listing.city_id);
  const category = getCategoryById(listing.category_id);
  const subcategoryName = getSubcategoryName(listing.category_id, listing.subcategory_id);
  const attributes = listing.attributes || {};
  const categoryDetails = attributes.categoryDetails || {};
  const cleanPhone = (sellerPhone || "").replace(/\D/g, "");
  const whatsappPhone = cleanPhone;
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${listing.title}" sur TchadMarket.`)}`;
  const callLink = `tel:+${cleanPhone}`;
  const phoneFormatted = cleanPhone.length >= 11
    ? `+${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7, 9)} ${cleanPhone.slice(9)}`
    : (sellerPhone || "");
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: fr });
  const reference = listing.id.slice(0, 8).toUpperCase();
  const mainInfo: DetailItem[] = [
    { label: "Référence", value: reference, icon: Hash },
    { label: "Publié", value: formatDate(listing.created_at), icon: CalendarDays },
    { label: "Mis à jour", value: formatDate(listing.updated_at || listing.created_at), icon: RefreshCw },
    { label: "Vues", value: listing.view_count || 0, icon: Eye },
    { label: "Favoris", value: favoriteCount, icon: Heart },
    { label: "Type vendeur", value: sellerProfile?.is_verified ? "Vendeur vérifié" : "Particulier", icon: BadgeCheck },
  ];
  const detailInfo: DetailItem[] = [
    { label: "État", value: getAttributeValue(categoryDetails, ["Etat", "État", "Etat du vehicule"]), icon: Shield },
    { label: "Prix négociable", value: attributes.priceType ? priceTypeLabels[attributes.priceType] : null, icon: Tag },
    { label: "Catégorie", value: category?.name, icon: ListChecks },
    { label: "Sous-catégorie", value: subcategoryName, icon: Info },
    { label: "Ville", value: city?.name, icon: MapPin },
    { label: "Quartier", value: listing.quartier, icon: MapPin },
  ];
  const characteristicLabels = categoryCharacteristicLabels[listing.category_id] || ["Marque", "Modèle", "État", "Garantie", "Accessoires"];
  const filledCharacteristics = Object.entries(categoryDetails).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });
  const visibleCharacteristics = filledCharacteristics.length > 0
    ? filledCharacteristics
    : characteristicLabels.map((label) => [label, getCharacteristicValue(categoryDetails, label)] as [string, string | string[] | undefined]);

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-background pb-28">
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-foreground flex flex-col animate-fade-in">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10 bg-card/20 rounded-full p-2.5 backdrop-blur-sm">
            <X className="h-6 w-6 text-card" />
          </button>
          <div
            className="flex-1 flex items-center justify-center relative"
            onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
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
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
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

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className={cn("w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all", i === currentImg ? "border-primary" : "border-transparent opacity-60")}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-5 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-primary mb-1">{formatPrice(listing.price)}</h2>
        <h1 className="text-lg font-bold text-foreground mb-2">{listing.title}</h1>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{category ? t(`cat.${category.id}`) : ""}</span>
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

        {/* Main listing information */}
        <div className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-card">
          <div className="bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Annonce</p>
                <h2 className="text-base font-extrabold">Informations principales</h2>
              </div>
              <div className="rounded-xl bg-primary-foreground/15 p-2">
                <BadgeCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border/70">
            {mainInfo.map((item, index) => {
              const Icon = item.icon;
              const isFeatured = index < 2;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "min-w-0 bg-card p-3",
                    isFeatured && "col-span-2 xs:col-span-1 bg-accent/45"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      isFeatured ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                    )}>
                      {Icon && <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 truncate text-sm font-extrabold text-foreground">{formatDetailValue(item.value)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured details */}
        <div className="mb-5 rounded-2xl border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-primary">Fiche produit</p>
              <h2 className="text-base font-extrabold text-foreground">Détails de l'annonce</h2>
            </div>
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            {detailInfo.map((item) => {
              const Icon = item.icon;
              const value = formatDetailValue(item.value);
              return (
                <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-card">
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">{item.label}</p>
                  <p className={cn("max-w-[55%] truncate text-right text-sm font-extrabold", value === emptyValue ? "text-muted-foreground" : "text-foreground")}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category characteristics */}
        <div className="mb-5 rounded-2xl border bg-card p-4 shadow-card">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Info className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-primary">Comparaison</p>
              <h2 className="text-base font-extrabold text-foreground">Caractéristiques</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {visibleCharacteristics.map(([label, value]) => {
              const formattedValue = formatDetailValue(value);
              const isEmpty = formattedValue === emptyValue;
              return (
                <div
                  key={label}
                  className={cn(
                    "min-h-[76px] rounded-xl border px-3 py-2.5",
                    isEmpty ? "border-dashed bg-muted/15" : "border-primary/15 bg-accent/35"
                  )}
                >
                  <p className="truncate text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
                  <p className={cn("mt-1 line-clamp-2 text-sm font-extrabold leading-snug", isEmpty ? "text-muted-foreground" : "text-foreground")}>
                    {formattedValue}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/50 my-4" />
        
        <p className="text-sm text-foreground/80 leading-relaxed mb-6">{listing.description}</p>

        {/* Seller profile card */}
        {sellerProfile && (
          <Link
            to={`/vendeur/${listing?.user_id}`}
            className="block bg-card border rounded-2xl p-4 mb-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <img
                  src={sellerProfile.avatar_url || "/placeholder.svg"}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover bg-muted"
                />
                {sellerStats?.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-foreground truncate">{sellerProfile.display_name || t("detail.seller")}</span>
                  {sellerProfile.is_verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                  {sellerStats && sellerStats.trustScore >= 60 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      <Shield className="h-3 w-3" />
                      {sellerStats.trustScore}/100
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                  {sellerStats?.isOnline ? (
                    <span className="font-medium text-green-600">En ligne</span>
                  ) : sellerStats?.lastSeen ? (
                    <span>{sellerStats.lastSeen}</span>
                  ) : null}
                  {reviewCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-chad-yellow text-chad-yellow" />
                      {sellerAvg} ({reviewCount})
                    </span>
                  )}
                  <span>{t("detail.memberSince")} {formatDistanceToNow(new Date(sellerProfile.created_at), { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>

            {sellerStats && (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sellerStats.verifications.email && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                      <Mail className="h-3 w-3" />
                      Email
                    </span>
                  )}
                  {sellerStats.verifications.phone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                      <Phone className="h-3 w-3" />
                      Tel vérifié
                    </span>
                  )}
                  {sellerStats.verifications.identity && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                      <UserCheck className="h-3 w-3" />
                      Identité
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-muted/35 p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-foreground">
                      <ListChecks className="h-3.5 w-3.5" />
                      <p className="text-sm font-extrabold">{sellerStats.activeListings}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Annonces</p>
                  </div>
                  <div className="rounded-xl bg-muted/35 p-2 text-center">
                    <p className="text-sm font-extrabold text-green-600">{sellerStats.responseRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Réponse</p>
                  </div>
                  <div className="rounded-xl bg-muted/35 p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[hsl(var(--chad-yellow))]">
                      <Timer className="h-3.5 w-3.5" />
                      <p className="text-sm font-extrabold">{sellerStats.avgResponseTime}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Délai</p>
                  </div>
                </div>
              </>
            )}
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="gap-2 rounded-2xl h-11" onClick={handleNativeShare}>
            <Share2 className="h-4 w-4" />{t("detail.share")}
          </Button>
          <Button
            variant="outline"
            className={cn("gap-2 rounded-2xl h-11", isFav && "border-chad-red text-chad-red")}
            onClick={() => toggleFav.mutate({ listingId: listing.id, isFav })}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-chad-red")} />
            {isFav ? t("detail.saved") : t("detail.save")}
          </Button>
          <Button
            variant="outline"
            className="col-span-2 gap-2 rounded-2xl h-11 text-destructive hover:text-destructive"
            onClick={handleReportListing}
            disabled={isReporting || isOwner}
          >
            <Flag className="h-4 w-4" />
            Signaler
          </Button>
        </div>
      </div>

      {/* Reviews section */}
      <div className="px-4 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-foreground">{t("detail.sellerReviews")}</h2>
          {user && !isOwner && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {showReviewForm ? t("detail.cancel") : t("detail.giveReview")}
            </button>
          )}
        </div>

        {/* Review rating bars */}
        {reviewCount > 0 && (
          <div className="bg-card border rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-foreground">{sellerAvg}</p>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={cn("h-3 w-3", s <= Math.round(sellerAvg) ? "fill-chad-yellow text-chad-yellow" : "text-muted-foreground/30")} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{reviewCount} avis</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] w-3 text-muted-foreground">{star}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-chad-yellow rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
              placeholder={t("detail.commentPlaceholder")}
              rows={2}
              className="rounded-xl mb-2"
              maxLength={500}
            />
            <Button onClick={handleSubmitReview} size="sm" className="rounded-xl" disabled={submitReview.isPending}>
              {t("detail.publishReview")}
            </Button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("detail.noReviews")}</p>
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
          <h3 className="font-extrabold text-sm mb-2.5 flex items-center gap-2">{t("safety.title")}</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>{t("safety.tip1")}</li>
            <li>{t("safety.tip2")}</li>
            <li>{t("safety.tip3")}</li>
            <li>{t("safety.tip4")}</li>
          </ul>
        </div>
      </div>

      <SimilarProducts currentListing={listing} allListings={allListings} />

      <CoViewedProducts listingId={listing.id} />

      <ContactActions
        isVerified={!!sellerProfile?.is_verified}
        whatsappLink={whatsappLink}
        callLink={callLink}
        phoneFormatted={phoneFormatted}
        onChat={handleStartChat}
        isChatDisabled={startConversation.isPending}
        canChat={!isOwner}
        sellerName={sellerProfile?.display_name}
      />
    </div>
  );
};

export default ListingDetail;
