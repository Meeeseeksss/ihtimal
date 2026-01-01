// src/data/mockMarkets.ts

export type MarketStatus = "TRADING" | "HALTED" | "RESOLVED";
export type MarketJurisdiction = "US" | "EU" | "INTL";
export type MarketCategory = "CRYPTO" | "POLITICS" | "SPORTS";

export type Market = {
  id: string;
  question: string;
  yesPrice: number;        // 0..1 (implied probability)
  volumeUsd: number;       // total traded volume
  resolvesAt: string;      // ISO datetime
  jurisdiction: MarketJurisdiction;
  status: MarketStatus;
  category: MarketCategory;
};

export const mockMarkets: Market[] = [
  {
    id: "btc-100k-2026",
    question: "Will Bitcoin trade above $100,000 by June 30, 2026?",
    yesPrice: 0.42,
    volumeUsd: 1_823_450,
    resolvesAt: "2026-06-30T23:59:59Z",
    jurisdiction: "INTL",
    status: "TRADING",
    category: "CRYPTO",
  },
  {
    id: "eth-etf-approval-2025",
    question: "Will an Ethereum spot ETF be approved in the US by Jan 31, 2026?",
    yesPrice: 0.67,
    volumeUsd: 945_200,
    resolvesAt: "2025-12-31T23:59:59Z",
    jurisdiction: "US",
    status: "TRADING",
    category: "CRYPTO",
  },
  {
    id: "candidate-x-2026-election",
    question: "Will Candidate X win the 2026 national election?",
    yesPrice: 0.57,
    volumeUsd: 845_200,
    resolvesAt: "2026-11-08T23:59:59Z",
    jurisdiction: "US",
    status: "TRADING",
    category: "POLITICS",
  },
  {
    id: "eu-ai-act-2025",
    question: "Will the EU fully enforce the AI Act by June 2026?",
    yesPrice: 0.48,
    volumeUsd: 412_800,
    resolvesAt: "2025-12-15T23:59:59Z",
    jurisdiction: "EU",
    status: "TRADING",
    category: "POLITICS",
  },
  {
    id: "world-cup-2026-team-a",
    question: "Will Team A win the 2026 World Cup?",
    yesPrice: 0.31,
    volumeUsd: 245_990,
    resolvesAt: "2026-07-19T23:59:59Z",
    jurisdiction: "INTL",
    status: "HALTED",
    category: "SPORTS",
  },
  {
    id: "champions-league-2025-team-b",
    question: "Will Team B win the 2026 Champions League?",
    yesPrice: 0.36,
    volumeUsd: 318_400,
    resolvesAt: "2025-05-28T23:59:59Z",
    jurisdiction: "EU",
    status: "TRADING",
    category: "SPORTS",
  },
  {
    id: "fed-rate-cut-2025",
    question: "Will the Federal Reserve cut interest rates by September 2025?",
    yesPrice: 0.54,
    volumeUsd: 1_120_600,
    resolvesAt: "2025-09-30T23:59:59Z",
    jurisdiction: "US",
    status: "TRADING",
    category: "POLITICS",
  },
  {
    id: "btc-halving-impact-2025",
    question: "Will Bitcoin reach a new all-time high within 6 months of the 2024 halving?",
    yesPrice: 0.67,
    volumeUsd: 2_405_900,
    resolvesAt: "2025-10-01T23:59:59Z",
    jurisdiction: "INTL",
    status: "RESOLVED",
    category: "CRYPTO",
  },
];
