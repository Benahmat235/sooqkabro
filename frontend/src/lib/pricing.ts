export interface PriceStats {
  count: number;
  min: number;
  max: number;
  p25: number;
  median: number;
  p75: number;
}

export type PriceLevel = "good" | "high" | "normal" | "unknown";

/**
 * Classify a listing price against category stats.
 * - "good"   : price <= p25 (Bon prix)
 * - "high"   : price >= p75 (Prix élevé)
 * - "normal" : between p25 and p75
 * - "unknown": not enough data
 */
export function classifyPrice(price: number, stats?: PriceStats | null): PriceLevel {
  if (!stats || stats.count < 5 || !price || price <= 0) return "unknown";
  if (price <= stats.p25) return "good";
  if (price >= stats.p75) return "high";
  return "normal";
}

export const priceLevelLabel: Record<PriceLevel, string> = {
  good: "Bon prix",
  high: "Prix élevé",
  normal: "Prix juste",
  unknown: "",
};
