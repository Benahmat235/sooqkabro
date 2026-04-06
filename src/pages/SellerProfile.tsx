import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Star, 
  BadgeCheck, 
  Shield, 
  Mail, 
  Phone, 
  UserCheck, 
  ShoppingBag, 
  MessageSquare, 
  Zap,
  Share2,
  Filter,
  ChevronDown,
  Heart,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSellerStats } from "@/hooks/useSellerStats";
import { useSellerReviews, useSellerRating } from "@/hooks/useSellerReviews";
import { useSellerFollowers } from "@/hooks/useSellerFollowers";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type ReviewFilter = "all" | "5" | "4" | "3" | "2" | "1";
type ReviewSort = "recent" | "highest" | "lowest";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewSort, setReviewSort] = useState<ReviewSort>("recent");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: sellerStats } = useSellerStats(sellerId);
  const { data: reviews = [] } = useSellerReviews(sellerId);
  const { avg: sellerAvg, count: reviewCount } = useSellerRating(sellerId);
  const { data: allListings = [] } = useListings();
  const { data: followersData, loading: followLoading, toggleFollow } = useSellerFollowers(sellerId);

  // Get seller's listings
  const sellerListings = useMemo(() => {
    return allListings.filter((l) => l.user_id === sellerId);
  }, [allListings, sellerId]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filter
    if (reviewFilter !== "all") {
      const rating = parseInt(reviewFilter);
      result = result.filter((r) => r.rating === rating);
    }

    // Apply sort
    if (reviewSort === "recent") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (reviewSort === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviews, reviewFilter, reviewSort]);

  useEffect(() => {
    if (!sellerId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sellerId)
        .maybeSingle();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [sellerId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/vendeur/${sellerId}`;
    const text = `Profil de ${profile?.display_name || "Vendeur"} sur TchadMarket`;

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copie!", description: "Le lien du profil a ete copie." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">Vendeur introuvable</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block hover:underline">
            Retour a l'accueil
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" className="focus-ring rounded-lg" aria-label="Retour">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-extrabold flex-1">Profil vendeur</h1>
        <button 
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-muted transition-colors focus-ring"
          aria-label="Partager"
        >
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name}
              className="w-20 h-20 rounded-full object-cover bg-muted"
            />
            {sellerStats?.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{profile.display_name || "Vendeur"}</h2>
              {profile.is_verified && (
                <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
              )}
              {sellerAvg >= 4.5 && reviewCount >= 3 && (
                <span className="bg-[hsl(var(--chad-yellow))]/20 text-[hsl(var(--chad-yellow))] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Top Vendeur
                </span>
              )}
            </div>

            {/* Online status */}
            {sellerStats?.isOnline ? (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                En ligne
              </span>
            ) : sellerStats?.lastSeen ? (
              <span className="text-sm text-muted-foreground mt-1">{sellerStats.lastSeen}</span>
            ) : null}

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star 
                      key={s} 
                      className={cn(
                        "h-4 w-4", 
                        s <= Math.round(sellerAvg) 
                          ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))]" 
                          : "text-muted-foreground/30"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground">{sellerAvg}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} avis)</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Badges */}
        {sellerStats && (
          <div className="flex flex-wrap gap-2">
            {sellerStats.verifications.email && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <Mail className="h-3.5 w-3.5" /> Email verifie
              </span>
            )}
            {sellerStats.verifications.phone && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <Phone className="h-3.5 w-3.5" /> Telephone verifie
              </span>
            )}
            {sellerStats.verifications.identity && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                <UserCheck className="h-3.5 w-3.5" /> Identite verifiee
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {sellerStats?.bio && (
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">A propos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{sellerStats.bio}</p>
          </div>
        )}

        {/* Stats */}
        {sellerStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-2xl font-bold">{sellerStats.activeListings}</span>
              </div>
              <p className="text-xs text-muted-foreground">Annonces</p>
            </div>
            <div className="bg-card border rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <MessageSquare className="h-5 w-5" />
                <span className="text-2xl font-bold">{sellerStats.responseRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Reponse</p>
            </div>
            <div className="bg-card border rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[hsl(var(--chad-yellow))] mb-1">
                <Zap className="h-5 w-5" />
                <span className="text-2xl font-bold">{sellerStats.avgResponseTime}</span>
              </div>
              <p className="text-xs text-muted-foreground">Temps</p>
            </div>
          </div>
        )}

        {/* Followers Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{followersData.followerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Abonnes</p>
          </div>
          {user?.id !== sellerId && (
            <Button
              onClick={toggleFollow}
              disabled={followLoading}
              variant={followersData.isFollowing ? "outline" : "default"}
              className={cn(
                "rounded-2xl font-semibold",
                followersData.isFollowing && "border-primary/50"
              )}
            >
              {followLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : followersData.isFollowing ? (
                <>
                  <Heart className="h-4 w-4 fill-current mr-1" />
                  Abonne
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-1" />
                  S'abonner
                </>
              )}
            </Button>
          )}
        </div>

        {/* Seller's Listings */}
        {sellerListings.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              Annonces ({sellerListings.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sellerListings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {sellerListings.length > 6 && (
              <Link 
                to={`/recherche?vendeur=${sellerId}`}
                className="block text-center text-sm text-primary font-semibold mt-4 hover:underline"
              >
                Voir toutes les annonces ({sellerListings.length})
              </Link>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Avis ({reviewCount})
            </h3>
          </div>

          {/* Rating Summary */}
          {reviewCount > 0 && (
            <div className="bg-card border rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-foreground">{sellerAvg}</p>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-4 w-4", 
                          s <= Math.round(sellerAvg) 
                            ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))]" 
                            : "text-muted-foreground/30"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{reviewCount} avis</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => setReviewFilter(reviewFilter === String(star) ? "all" : String(star) as ReviewFilter)}
                        className={cn(
                          "flex items-center gap-2 w-full group",
                          reviewFilter === String(star) && "opacity-100",
                          reviewFilter !== "all" && reviewFilter !== String(star) && "opacity-40"
                        )}
                      >
                        <span className="text-xs w-3 text-muted-foreground">{star}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[hsl(var(--chad-yellow))] rounded-full transition-all" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setReviewFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 focus-ring",
                  reviewFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Tous ({reviewCount})
              </button>
              {[5,4,3,2,1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                if (count === 0) return null;
                return (
                  <button
                    key={star}
                    onClick={() => setReviewFilter(String(star) as ReviewFilter)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 focus-ring flex items-center gap-1",
                      reviewFilter === String(star)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {star} <Star className="h-3 w-3 fill-current" /> ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Sort */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground">Trier par:</span>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
                className="text-xs bg-muted rounded-lg px-2 py-1 border-0 focus-ring"
              >
                <option value="recent">Plus recents</option>
                <option value="highest">Note la plus haute</option>
                <option value="lowest">Note la plus basse</option>
              </select>
            </div>
          )}

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {reviewFilter !== "all" ? "Aucun avis avec cette note" : "Aucun avis pour le moment"}
            </p>
          ) : (
            <div className="space-y-3">
              {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)).map((review) => (
                <div key={review.id} className="bg-card border rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={review.reviewer_avatar || "/placeholder.svg"} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover bg-muted" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {review.reviewer_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star 
                              key={s} 
                              className={cn(
                                "h-3 w-3", 
                                s <= review.rating 
                                  ? "fill-[hsl(var(--chad-yellow))] text-[hsl(var(--chad-yellow))]" 
                                  : "text-muted-foreground/30"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}

              {filteredReviews.length > 5 && !showAllReviews && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="w-full py-3 text-sm text-primary font-semibold hover:underline focus-ring rounded-lg"
                >
                  Voir tous les avis ({filteredReviews.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Member since */}
        <p className="text-center text-xs text-muted-foreground">
          Membre depuis {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: fr })}
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default SellerProfile;
