// src/data/mockMarketDetails.ts
export type MarketSourceLink = {
  label: string;
  url: string;
};

export type MarketDetails = {
  marketId: string;
  /** Short context paragraph shown on the market page. */
  summary: string;
  /** More explicit resolution copy to reduce ambiguity. */
  resolution: {
    criteria: string;
    sourceOfTruth: string;
    payout: string;
    edgeCases?: string[];
  };
  sources: MarketSourceLink[];
  relatedMarketIds?: string[];
};

/**
 * UI-only mock details to make the Market Detail page feel closer to Kalshi.
 * When a backend exists, replace this with a real market details endpoint.
 */
export const mockMarketDetailsById: Record<string, MarketDetails> = {
  "btc-100k-2026": {
    marketId: "btc-100k-2026",
    summary:
      "Trade on whether Bitcoin will be above $100,000 at any time before the market close. This is a single-outcome YES/NO contract that settles based on a specified reference price source.",
    resolution: {
      criteria:
        "Resolves YES if the BTC/USD reference price is greater than or equal to $100,000 at any time on or before the close timestamp. Otherwise resolves NO.",
      sourceOfTruth: "Reference BTC/USD price from the configured index/provider.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
      edgeCases: [
        "If the data source is unavailable, the market may use the nearest available published value.",
        "If the market is halted, orders may be cancelled or remain open depending on the halt reason.",
      ],
    },
    sources: [
      { label: "Index methodology (mock)", url: "https://example.com/btc-index" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["btc-halving-impact-2025", "eth-etf-approval-2025"],
  },

  "eth-etf-approval-2025": {
    marketId: "eth-etf-approval-2025",
    summary:
      "This market settles on whether a US-listed Ethereum spot ETF is approved by the specified deadline. Use it to express your view on regulatory outcomes and timing.",
    resolution: {
      criteria:
        "Resolves YES if an Ethereum spot ETF receives formal approval by the relevant US regulator on or before the close timestamp. Otherwise resolves NO.",
      sourceOfTruth: "Official regulator approval notice / public filings.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
      edgeCases: [
        "If approval occurs after the close timestamp, the market resolves NO.",
        "If multiple products are approved, any qualifying approval is sufficient.",
      ],
    },
    sources: [
      { label: "Regulator announcements (mock)", url: "https://example.com/regulator" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["btc-100k-2026"],
  },

  "candidate-x-2026-election": {
    marketId: "candidate-x-2026-election",
    summary:
      "Trade the outcome of the 2026 national election. This contract settles based on the officially certified winner announced by the election authority.",
    resolution: {
      criteria:
        "Resolves YES if Candidate X is officially certified as the winner of the referenced election. Otherwise resolves NO.",
      sourceOfTruth: "Official election certification (election authority).",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
      edgeCases: [
        "If the outcome is contested, the market resolves based on final certification.",
        "If the election is delayed, the market may extend or halt according to rules.",
      ],
    },
    sources: [
      { label: "Election authority (mock)", url: "https://example.com/elections" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["fed-rate-cut-2025", "eu-ai-act-2025"],
  },

  "eu-ai-act-2025": {
    marketId: "eu-ai-act-2025",
    summary:
      "A regulatory-timing contract focused on whether the EU AI Act is fully enforceable by the deadline. Use it as a view on policy implementation timelines.",
    resolution: {
      criteria:
        "Resolves YES if the EU AI Act is fully in force and enforceable by the specified date, based on official EU publication and enforcement milestones. Otherwise resolves NO.",
      sourceOfTruth: "Official EU publications and enforcement notices.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
    },
    sources: [
      { label: "EU official journal (mock)", url: "https://example.com/eu-journal" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["candidate-x-2026-election"],
  },

  "world-cup-2026-team-a": {
    marketId: "world-cup-2026-team-a",
    summary:
      "Sports championship futures contract. Trade whether Team A will win the 2026 World Cup. Settlement is based on the official tournament organizer result.",
    resolution: {
      criteria:
        "Resolves YES if Team A is officially declared the winner of the 2026 World Cup final. Otherwise resolves NO.",
      sourceOfTruth: "Official tournament organizer result.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
      edgeCases: ["If the tournament format changes, settlement follows the official declared champion."],
    },
    sources: [
      { label: "Tournament organizer (mock)", url: "https://example.com/world-cup" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["champions-league-2025-team-b"],
  },

  "champions-league-2025-team-b": {
    marketId: "champions-league-2025-team-b",
    summary:
      "Trade whether Team B will win the Champions League. Settlement is based on the official tournament champion.",
    resolution: {
      criteria:
        "Resolves YES if Team B is officially declared Champions League winner for the referenced season. Otherwise resolves NO.",
      sourceOfTruth: "Official organizer results.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
    },
    sources: [
      { label: "Organizer results (mock)", url: "https://example.com/champions-league" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["world-cup-2026-team-a"],
  },

  "fed-rate-cut-2025": {
    marketId: "fed-rate-cut-2025",
    summary:
      "Macro policy contract that settles based on whether the Federal Reserve cuts rates by the deadline. Intended to track the target rate decision outcome.",
    resolution: {
      criteria:
        "Resolves YES if the target rate is lower than it was at market open at any scheduled decision on or before the close timestamp. Otherwise resolves NO.",
      sourceOfTruth: "Official Federal Reserve rate announcement.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
    },
    sources: [
      { label: "FOMC statements (mock)", url: "https://example.com/fomc" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["candidate-x-2026-election"],
  },

  "btc-halving-impact-2025": {
    marketId: "btc-halving-impact-2025",
    summary:
      "A resolved crypto market used as an example. Useful for demonstrating how resolved markets look and behave in the UI.",
    resolution: {
      criteria: "Resolves based on whether BTC reached a new all-time high within the stated window.",
      sourceOfTruth: "Reference BTC/USD index/provider.",
      payout: "Winning shares pay $1.00. Losing shares pay $0.00.",
    },
    sources: [
      { label: "Price index (mock)", url: "https://example.com/btc-index" },
      { label: "Market rules (mock)", url: "https://example.com/market-rules" },
    ],
    relatedMarketIds: ["btc-100k-2026"],
  },
};
