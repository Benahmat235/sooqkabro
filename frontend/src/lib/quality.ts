/**
 * Listing Quality Score
 * Compute a 0-100 score for a listing based on completeness and trust signals.
 * Used both client-side (live indicator during publication, display in MyListings)
 * and server-side (Edge Function ranking boost in personalized feed).
 *
 * Keep this module pure and dependency-free so it can be ported to Deno.
 */

export interface QualityInput {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  quartier?: string | null;
  phone?: string | null;
  imageCount?: number;
  sellerVerified?: boolean;
  sellerAvgRating?: number | null;
  sellerReviewCount?: number;
}

export interface QualityResult {
  score: number; // 0-100
  level: "weak" | "fair" | "good" | "excellent";
  suggestions: string[];
  breakdown: Record<string, number>;
}

export function computeListingQuality(input: QualityInput): QualityResult {
  const suggestions: string[] = [];
  const breakdown: Record<string, number> = {};

  // Photos (0-25): 5 photos = max
  const photos = Math.min(input.imageCount ?? 0, 5);
  const photoScore = (photos / 5) * 25;
  breakdown.photos = Math.round(photoScore);
  if (photos < 3) suggestions.push(`Ajoutez ${3 - photos} photo(s) pour rassurer les acheteurs`);
  else if (photos < 5) suggestions.push(`Ajoutez encore ${5 - photos} photo(s) (max 5)`);

  // Title (0-10)
  const titleLen = (input.title || "").trim().length;
  let titleScore = 0;
  if (titleLen >= 10 && titleLen <= 80) titleScore = 10;
  else if (titleLen >= 5) titleScore = 6;
  else if (titleLen > 0) titleScore = 3;
  breakdown.title = titleScore;
  if (titleLen < 10) suggestions.push("Allongez votre titre (10 à 80 caractères)");

  // Description (0-25)
  const descLen = (input.description || "").trim().length;
  let descScore = 0;
  if (descLen >= 150) descScore = 25;
  else if (descLen >= 80) descScore = 18;
  else if (descLen >= 40) descScore = 10;
  else if (descLen > 0) descScore = 4;
  breakdown.description = descScore;
  if (descLen < 80) {
    suggestions.push(
      descLen < 40
        ? "Rédigez une description (au moins 80 caractères)"
        : "Détaillez votre description (visez 150+ caractères)"
    );
  }

  // Price (0-10): present and > 0
  const priceScore = input.price && input.price > 0 ? 10 : 0;
  breakdown.price = priceScore;
  if (priceScore === 0) suggestions.push("Renseignez un prix réaliste");

  // Quartier (0-5)
  const quartierScore = (input.quartier || "").trim().length > 0 ? 5 : 0;
  breakdown.quartier = quartierScore;
  if (quartierScore === 0) suggestions.push("Précisez votre quartier pour les acheteurs locaux");

  // Phone (0-10): valid +235 format
  const phone = (input.phone || "").trim();
  const phoneScore = /^\+235\d{8}$/.test(phone) ? 10 : 0;
  breakdown.phone = phoneScore;
  if (phoneScore === 0) suggestions.push("Indiquez un numéro Tchad valide (+235XXXXXXXX)");

  // Seller verified (0-10)
  const verifiedScore = input.sellerVerified ? 10 : 0;
  breakdown.verified = verifiedScore;

  // Seller reputation (0-5): avg rating ≥ 4 with ≥ 3 reviews
  let reputationScore = 0;
  if ((input.sellerReviewCount ?? 0) >= 3) {
    const avg = input.sellerAvgRating ?? 0;
    if (avg >= 4.5) reputationScore = 5;
    else if (avg >= 4) reputationScore = 4;
    else if (avg >= 3) reputationScore = 2;
  }
  breakdown.reputation = reputationScore;

  const total = Math.round(
    photoScore + titleScore + descScore + priceScore + quartierScore + phoneScore + verifiedScore + reputationScore
  );

  let level: QualityResult["level"] = "weak";
  if (total >= 85) level = "excellent";
  else if (total >= 65) level = "good";
  else if (total >= 40) level = "fair";

  return { score: Math.min(100, total), level, suggestions, breakdown };
}

export const qualityLevelColor: Record<QualityResult["level"], string> = {
  weak: "text-destructive",
  fair: "text-orange-500",
  good: "text-yellow-600",
  excellent: "text-green-600",
};

export const qualityLevelLabel: Record<QualityResult["level"], string> = {
  weak: "Faible",
  fair: "Moyen",
  good: "Bon",
  excellent: "Excellent",
};
