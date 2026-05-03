import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Heart,
  Loader2,
  MapPin,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Flag,
  Grid3X3,
  List
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSellerStats } from "@/hooks/useSellerStats";
import { useSellerReviews, useSellerRating } from "@/hooks/useSellerReviews";
import { useSellerFollowers } from "@/hooks/useSellerFollowers";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation } from "@/hooks/useConversations";
import { useInfiniteScroll, InfiniteScrollLoader, InfiniteScrollSentinel } from "@/hooks/useInfiniteScroll";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: sellerStats } = useSellerStats(sellerId);
  const { data: reviews = [] } = useSellerReviews(sellerId);
  const { avg: sellerAvg, count: reviewCount } = useSellerRating(sellerId);
  const { data: allListings = [] } = useListings();
  const { data: followersData, loading: followLoading, toggleFollow } = useSellerFollowers(sellerId);
  const startConversation = useStartConversation();

  const sellerListings = useMemo(() => {
    return allListings.filter((l) => l.user_id === sellerId);
  }, [allListings, sellerId]);

  const filteredReviews = useMemo(() => {
    if (starFilter === null) return reviews;
    return reviews.filter((r) => r.rating === starFilter);
  }, [reviews, starFilter]);

  const { visibleItems: visibleListings, hasMore, isLoading: loadingMore, sentinelRef } = useInfiniteScroll({
    items: sellerListings,
    initialCount: 8,
    incrementCount: 6,
  });

  useEffect(() => {
    if (!sellerId) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await supabase
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
    const text = `Profil de ${profile?.display_name || "Vendeur"} sur SooqKabro`;
    if (navigator.share) {
      try { 
        await navigator.share({ title: text, url }); 
      } catch (error) {
        // User cancelled share or share failed - fallback to clipboard
        console.log("Share cancelled or failed:", error);
        try {
          await navigator.clipboard.writeText(url);
          toast({ title: "Lien copié!", description: "Le lien du profil a été copié." });
        } catch {
          console.error("Failed to copy to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copié!", description: "Le lien du profil a été copié." });
    }
  };

  const handleStartChat = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!sellerId || user.id === sellerId) return;
    try {
      await startConversation.mutateAsync({
        listingId: sellerListings[0]?.id || "",
        buyerId: user.id,
        sellerId: sellerId,
      });
      navigate("/messages");
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Hero skeleton */}
        <div className="relative">
          <Skeleton className="h-32 w-full" />
          <div className="absolute -bottom-12 left-4">
            <Skeleton className="w-24 h-24 rounded-2xl" />
          </div>
        </div>
        <div className="pt-16 px-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <UserCheck className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">Vendeur introuvable</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block hover:underline">
            Retour a l&apos;accueil
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const memberSince = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: fr });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Banner */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        
        {/* Back button */}
        <Link 
          to="/" 
          className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Signaler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative">
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name}
              className="w-24 h-24 rounded-2xl object-cover bg-muted border-4 border-background shadow-lg"
            />
            {sellerStats?.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-16 px-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{profile.display_name || "Vendeur"}</h1>
              {profile.is_verified && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
              {sellerAvg >= 4.5 && reviewCount >= 3 && (
                <span className="bg-[hsl(var(--chad-yellow))]/20 text-[hsl(var(--chad-yellow))] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Top
                </span>
              )}
              {sellerStats && sellerStats.trustScore >= 60 && (
                <span
                  className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  title={`Email: ${sellerStats.trustBreakdown.emailVerified ? '✓' : '✗'} • Téléphone: ${sellerStats.trustBreakdown.phoneVerified ? '✓' : '✗'} • Avis: ${sellerStats.trustBreakdown.goodReviews ? '✓' : '✗'} • Ancienneté: ${sellerStats.trustBreakdown.accountAge ? '✓' : '✗'} • Aucun signalement: ${sellerStats.trustBreakdown.noFlags ? '✓' : '✗'}`}
                >
                  <Shield className="h-3 w-3" /> Vendeur de confiance {sellerStats.trustScore}/100
                </span>
              )}
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              {sellerStats?.isOnline ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  En ligne
                </span>
              ) : sellerStats?.lastSeen && (
                <span>{sellerStats.lastSeen}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {memberSince}
              </span>
            </div>

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
          <div className="flex flex-wrap gap-2 mb-4">
            {sellerStats.verifications.email && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <Mail className="h-3 w-3" /> Email
              </span>
            )}
            {sellerStats.verifications.phone && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <Phone className="h-3 w-3" /> Tel
              </span>
            )}
            {sellerStats.verifications.identity && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                <UserCheck className="h-3 w-3" /> ID
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          {user?.id !== sellerId && (
            <>
              <Button
                onClick={toggleFollow}
                disabled={followLoading}
                variant={followersData.isFollowing ? "outline" : "default"}
                className={cn(
                  "flex-1 rounded-xl font-semibold gap-2",
                  followersData.isFollowing && "border-primary/50"
                )}
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : followersData.isFollowing ? (
                  <>
                    <Heart className="h-4 w-4 fill-current" />
                    Abonne
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    S&apos;abonner
                  </>
                )}
              </Button>
              <Button 
                onClick={handleStartChat}
                variant="outline" 
                className="flex-1 rounded-xl font-semibold gap-2"
                disabled={startConversation.isPending}
              >
                <MessageSquare className="h-4 w-4" />
                Contacter
              </Button>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{sellerListings.length}</p>
            <p className="text-[10px] text-muted-foreground">Annonces</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{followersData.followerCount}</p>
            <p className="text-[10px] text-muted-foreground">Abonnes</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{sellerStats?.responseRate || 0}%</p>
            <p className="text-[10px] text-muted-foreground">Reponse</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[hsl(var(--chad-yellow))]">{sellerStats?.avgResponseTime || "—"}</p>
            <p className="text-[10px] text-muted-foreground">Delai</p>
          </div>
        </div>

        {/* Bio */}
        {sellerStats?.bio && (
          <div className="bg-card border rounded-xl p-4 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">A propos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{sellerStats.bio}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="px-4">
        <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-4">
          <TabsTrigger value="listings" className="flex-1 rounded-lg text-sm">
            Annonces ({sellerListings.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-lg text-sm">
            Avis ({reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-0">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {sellerListings.length} annonces actives
            </p>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {sellerListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune annonce pour le moment</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "gap-3",
                viewMode === "grid" ? "grid grid-cols-2" : "flex flex-col"
              )}>
                {visibleListings.map((listing, i) => (
                  <div
                    key={listing.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}
                  >
                    <ListingCard listing={listing} compact={viewMode === "grid"} />
                  </div>
                ))}
              </div>
              <InfiniteScrollLoader isLoading={loadingMore} />
              <InfiniteScrollSentinel sentinelRef={sentinelRef} hasMore={hasMore} />
            </>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          {/* Star Filter */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {[null, 5, 4, 3, 2, 1].map((star) => (
              <button
                key={star ?? "all"}
                onClick={() => setStarFilter(star)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors",
                  starFilter === star
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-muted hover:bg-muted/50"
                )}
              >
                {star === null ? "Tous" : `${star}★`}
              </button>
            ))}
          </div>

          {/* Rating Summary */}
          {reviewCount > 0 && (
            <div className="bg-card border rounded-xl p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{sellerAvg}</p>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-3.5 w-3.5", 
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
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3 text-muted-foreground">{star}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[hsl(var(--chad-yellow))] rounded-full transition-all" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{starFilter !== null ? `Aucun avis ${starFilter}★` : "Aucun avis pour le moment"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={review.reviewer_avatar || "/placeholder.svg"} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover bg-muted" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {review.reviewer_name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
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
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default SellerProfile;
