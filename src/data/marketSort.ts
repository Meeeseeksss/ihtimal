import type { Market } from "./mockMarkets";

export type MarketSortKey = "TRENDING" | "VOLUME" | "NEWEST" | "CLOSING_SOON";

export const MARKET_SORT_OPTIONS: MarketSortKey[] = [
  "TRENDING",
  "VOLUME",
  "NEWEST",
  "CLOSING_SOON",
];

export const MARKET_SORT_LABELS: Record<MarketSortKey, string> = {
  TRENDING: "Trending",
  VOLUME: "Volume",
  NEWEST: "Newest",
  CLOSING_SOON: "Closing soon",
};

export function sanitizeSort(v: unknown): MarketSortKey {
  return MARKET_SORT_OPTIONS.includes(v as MarketSortKey)
    ? (v as MarketSortKey)
    : "TRENDING";
}

/**
 * Deterministic pseudo-random in [0, 1) from a string.
 * Used to create stable "momentum" for TRENDING without backend metrics.
 */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Convert to uint32 then normalize
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function resolvesAtMs(m: { resolvesAt: string }): number {
  const t = Date.parse(m.resolvesAt);
  return Number.isFinite(t) ? t : 0;
}

/**
 * UI-only TRENDING score.
 *
 * We don't have real-time metrics (24h volume, price change, watchers, etc.),
 * so we approximate a Kalshi-like "trending" with:
 * - higher total volume
 * - closer-to-50/50 markets feel more "hot"
 * - nearing close time increases urgency
 * - stable per-market momentum factor (deterministic hash)
 */
export function trendScore(m: Market, nowMs: number = Date.now()): number {
  const vol = Math.log10(Math.max(1, m.volumeUsd)); // ~0..6 for typical values
  const volumeBoost = vol / 6; // normalize ~0..1

  const closeness = 1 - Math.abs(0.5 - m.yesPrice) * 2; // 1 at 0.5, 0 at 0/1
  const balanceBoost = clamp01(closeness);

  const closeMs = resolvesAtMs(m);
  const daysToClose = Math.max(0, (closeMs - nowMs) / (1000 * 60 * 60 * 24));
  const urgencyBoost = clamp01(1 / (daysToClose + 1));

  const momentum = hash01(m.id); // stable 0..1

  // Weighted blend (sum weights = 1)
  return volumeBoost * 0.55 + balanceBoost * 0.2 + urgencyBoost * 0.15 + momentum * 0.1;
}

export function sortMarkets(markets: Market[], sort: MarketSortKey): Market[] {
  const arr = [...markets];
  const now = Date.now();

  switch (sort) {
    case "VOLUME":
      arr.sort((a, b) => b.volumeUsd - a.volumeUsd);
      return arr;
    case "CLOSING_SOON":
      arr.sort((a, b) => resolvesAtMs(a) - resolvesAtMs(b));
      return arr;
    case "NEWEST":
      // No createdAt in mock data: approximate newest as farthest-out resolve time.
      // (If you later add createdAt, switch to that.)
      arr.sort((a, b) => resolvesAtMs(b) - resolvesAtMs(a));
      return arr;
    case "TRENDING":
    default:
      arr.sort((a, b) => trendScore(b, now) - trendScore(a, now));
      return arr;
  }
}
