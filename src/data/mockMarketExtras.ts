export type TimeRangeKey = "1H" | "1D" | "1W" | "ALL";

export type PricePoint = {
  t: number;        // epoch ms
  yes: number;      // 0..1
  vol: number;      // arbitrary volume per bucket
};

export type OrderBookLevel = {
  price: number;    // 0..1 (YES price)
  qty: number;      // shares
};

export type OrderBook = {
  asks: OrderBookLevel[]; // sorted low->high
  bids: OrderBookLevel[]; // sorted high->low
};

function now() {
  return Date.now();
}

function genSeries(hours: number, startYes = 0.52): PricePoint[] {
  const stepMs = 5 * 60 * 1000; // 5m
  const points = Math.max(12, Math.floor((hours * 60) / 5));
  let yes = startYes;

  const out: PricePoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const drift = (Math.random() - 0.5) * 0.012;
    yes = Math.min(0.99, Math.max(0.01, yes + drift));
    const t = now() - i * stepMs;
    out.push({ t, yes: Number(yes.toFixed(4)), vol: Math.round(50 + Math.random() * 400) });
  }
  return out;
}

export const mockHistoryByMarketId: Record<string, Record<TimeRangeKey, PricePoint[]>> = {
  "btc-100k-2026": {
    "1H": genSeries(1, 0.42),
    "1D": genSeries(24, 0.43),
    "1W": genSeries(24 * 7, 0.46),
    "ALL": genSeries(24 * 30, 0.40),
  },
  "election-x-2026": {
    "1H": genSeries(1, 0.57),
    "1D": genSeries(24, 0.55),
    "1W": genSeries(24 * 7, 0.58),
    "ALL": genSeries(24 * 30, 0.52),
  },
  "sports-final-2026": {
    "1H": genSeries(1, 0.31),
    "1D": genSeries(24, 0.33),
    "1W": genSeries(24 * 7, 0.36),
    "ALL": genSeries(24 * 30, 0.29),
  },
};

export const mockOrderBookByMarketId: Record<string, OrderBook> = {
  "btc-100k-2026": {
    asks: [
      { price: 0.431, qty: 1800 },
      { price: 0.437, qty: 2400 },
      { price: 0.445, qty: 2100 },
      { price: 0.452, qty: 1600 },
      { price: 0.468, qty: 1300 },
    ],
    bids: [
      { price: 0.422, qty: 2500 },
      { price: 0.417, qty: 1900 },
      { price: 0.409, qty: 3200 },
      { price: 0.402, qty: 2800 },
      { price: 0.395, qty: 2100 },
    ],
  },
  "election-x-2026": {
    asks: [
      { price: 0.586, qty: 1400 },
      { price: 0.593, qty: 2100 },
      { price: 0.601, qty: 1800 },
      { price: 0.612, qty: 1600 },
      { price: 0.628, qty: 1200 },
    ],
    bids: [
      { price: 0.571, qty: 2600 },
      { price: 0.563, qty: 2200 },
      { price: 0.556, qty: 3100 },
      { price: 0.548, qty: 1900 },
      { price: 0.536, qty: 1700 },
    ],
  },
  "sports-final-2026": {
    asks: [
      { price: 0.326, qty: 900 },
      { price: 0.334, qty: 1100 },
      { price: 0.349, qty: 800 },
      { price: 0.361, qty: 700 },
      { price: 0.379, qty: 600 },
    ],
    bids: [
      { price: 0.309, qty: 1200 },
      { price: 0.301, qty: 1400 },
      { price: 0.294, qty: 1000 },
      { price: 0.288, qty: 900 },
      { price: 0.275, qty: 800 },
    ],
  },
};

export type Position = {
  id: string;
  marketId: string;
  question: string;
  side: "YES" | "NO";
  shares: number;
  avgPrice: number;      // paid per share in $ terms, i.e. 0..1
  currentYes: number;    // current YES probability 0..1
  status: "OPEN" | "CLOSED" | "RESOLVED";
};

export const mockPositions: Position[] = [
  {
    id: "pos-1",
    marketId: "btc-100k-2026",
    question: "Will Bitcoin trade above $100,000 by June 30, 2026?",
    side: "YES",
    shares: 220,
    avgPrice: 0.39,
    currentYes: 0.42,
    status: "OPEN",
  },
  {
    id: "pos-2",
    marketId: "election-x-2026",
    question: "Will Candidate X win the 2026 election?",
    side: "NO",
    shares: 150,
    avgPrice: 0.44,
    currentYes: 0.57,
    status: "OPEN",
  },
  {
    id: "pos-3",
    marketId: "sports-final-2026",
    question: "Will Team A win the 2026 final?",
    side: "YES",
    shares: 80,
    avgPrice: 0.35,
    currentYes: 0.31,
    status: "OPEN",
  },
];

export type PnlPoint = { t: number; pnl: number };

export const mockPnlSeries: PnlPoint[] = (() => {
  const days = 30;
  const step = 24 * 60 * 60 * 1000;
  let pnl = 0;
  const out: PnlPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    pnl += (Math.random() - 0.45) * 18;
    out.push({ t: Date.now() - i * step, pnl: Number(pnl.toFixed(2)) });
  }
  return out;
})();

/** ---------------------------
 *  NEW: account seed data
 *  --------------------------- */

export type Wallet = { cashUsd: number };
export const mockInitialWallet: Wallet = { cashUsd: 500 };

export type RecentTrade = {
  id: string;
  marketId: string;
  ts: number;
  side: "YES" | "NO";
  price: number; // contract price (0..1) for selected side
  shares: number;
};

function genTrades(marketId: string, baseYes: number): RecentTrade[] {
  const out: RecentTrade[] = [];
  const nowMs = Date.now();
  for (let i = 0; i < 16; i++) {
    const ts = nowMs - i * (30_000 + Math.random() * 90_000);
    const side: "YES" | "NO" = Math.random() > 0.55 ? "YES" : "NO";
    const yes = Math.min(0.99, Math.max(0.01, baseYes + (Math.random() - 0.5) * 0.03));
    const price = side === "YES" ? yes : 1 - yes;
    out.push({
      id: `${marketId}-t-${i}`,
      marketId,
      ts,
      side,
      price: Number(price.toFixed(4)),
      shares: Math.round(10 + Math.random() * 260),
    });
  }
  return out.sort((a, b) => b.ts - a.ts);
}

export const mockSeedRecentTradesByMarketId: Record<string, RecentTrade[]> = {
  "btc-100k-2026": genTrades("btc-100k-2026", 0.42),
  "election-x-2026": genTrades("election-x-2026", 0.57),
  "sports-final-2026": genTrades("sports-final-2026", 0.31),
};

export type OpenOrder = {
  id: string;
  marketId: string;
  action: "BUY" | "SELL";
  side: "YES" | "NO";
  type: "LIMIT";
  limitPrice: number; // 0..1
  shares: number;
  createdAt: number;

  // reserved collateral (mock)
  reservedCashUsd?: number;
  reservedShares?: number;
};

export const mockSeedOpenOrders: OpenOrder[] = [
  {
    id: "ord-1",
    marketId: "btc-100k-2026",
    action: "BUY",
    side: "YES",
    type: "LIMIT",
    limitPrice: 0.41,
    shares: 250,
    createdAt: Date.now() - 1000 * 60 * 24,
    reservedCashUsd: 250 * 0.41 + 0.1,
  },
  {
    id: "ord-2",
    marketId: "election-x-2026",
    action: "SELL",
    side: "NO",
    type: "LIMIT",
    limitPrice: 0.46,
    shares: 80,
    createdAt: Date.now() - 1000 * 60 * 95,
    reservedShares: 80,
  },
];

export type Transaction = {
  id: string;
  ts: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE" | "TRADE_FEE" | "ORDER_PLACE" | "ORDER_CANCEL";
  amountUsd: number; // positive/negative cash movement, 0 for metadata-only entries
  note?: string;
};

export const mockSeedTransactions: Transaction[] = [
  {
    id: "tx-1",
    ts: Date.now() - 1000 * 60 * 60 * 26,
    type: "DEPOSIT",
    amountUsd: 500,
    note: "Card deposit (mock)",
  },
  {
    id: "tx-2",
    ts: Date.now() - 1000 * 60 * 60 * 5,
    type: "TRADE_FEE",
    amountUsd: -1.2,
    note: "Fees (mock)",
  },
  {
    id: "tx-3",
    ts: Date.now() - 1000 * 60 * 60 * 2,
    type: "WITHDRAWAL",
    amountUsd: -50,
    note: "Bank transfer (mock)",
  },
];

export const mockSeedPositions: Position[] = [...mockPositions];
