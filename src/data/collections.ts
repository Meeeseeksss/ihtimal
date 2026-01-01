import type { MarketCategory } from "./mockMarkets";

export type Collection = {
  id: string;
  title: string;
  description: string;
  primaryCategory?: MarketCategory;
  marketIds: string[];
};

/**
 * MOCK COLLECTIONS
 *
 * UI-only adapter layer until a real backend exists.
 * Keep IDs stable because routes reference them.
 */
export const collections: Collection[] = [
  {
    id: "election-2026",
    title: "2026 Election",
    description: "Top political markets tied to the 2026 cycle.",
    primaryCategory: "POLITICS",
    marketIds: ["candidate-x-2026-election", "fed-rate-cut-2025"],
  },
  {
    id: "crypto-bluechips",
    title: "Crypto Blue Chips",
    description: "High-volume crypto markets and major milestones.",
    primaryCategory: "CRYPTO",
    marketIds: ["btc-100k-2026", "eth-etf-approval-2025", "btc-halving-impact-2025"],
  },
  {
    id: "football-2026",
    title: "Football 2026",
    description: "Big matches and tournament outcomes.",
    primaryCategory: "SPORTS",
    marketIds: ["world-cup-2026-team-a", "champions-league-2025-team-b"],
  },
];

// Topic bubble label -> collection id
export const topicToCollectionId: Record<string, string> = {
  "2026 Election": "election-2026",
  Bitcoin: "crypto-bluechips",
  Ethereum: "crypto-bluechips",
  "US Politics": "election-2026",
  "Fed Rates": "election-2026",
  "World Cup": "football-2026",
};
