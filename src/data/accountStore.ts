import { useCallback, useSyncExternalStore } from "react";
import { mockMarkets } from "./mockMarkets";
import {
  mockInitialWallet,
  mockSeedOpenOrders,
  mockSeedPositions,
  mockSeedRecentTradesByMarketId,
  mockSeedTransactions,
  type OpenOrder,
  type Position,
  type RecentTrade,
  type Transaction,
} from "./mockMarketExtras";

type AccountState = {
  walletCashUsd: number;
  positions: Position[];
  openOrders: OpenOrder[];
  trades: RecentTrade[];
  transactions: Transaction[];
};

const KEY = "kalshiClone.accountStore.v1";

/**
 * Perf: build an ID → market lookup once.
 * This avoids repeatedly scanning mockMarkets with .find().
 */
const MARKET_BY_ID = new Map(mockMarkets.map((m) => [m.id, m] as const));

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function seedState(): AccountState {
  const seededTrades: RecentTrade[] = Object.values(mockSeedRecentTradesByMarketId).flat();
  return {
    walletCashUsd: mockInitialWallet.cashUsd,
    positions: [...mockSeedPositions],
    openOrders: [...mockSeedOpenOrders],
    trades: seededTrades.sort((a, b) => b.ts - a.ts).slice(0, 200),
    transactions: [...mockSeedTransactions].sort((a, b) => b.ts - a.ts).slice(0, 200),
  };
}

function loadState(): AccountState {
  const stored = safeParse<AccountState>(localStorage.getItem(KEY));
  if (stored) return stored;
  const seeded = seedState();
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

let state: AccountState = typeof window === "undefined" ? seedState() : loadState();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function setState(next: AccountState) {
  state = next;
  persist();
  emit();
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function sidePriceFromYes(yesPrice: number, side: "YES" | "NO") {
  const yes = clamp01(yesPrice);
  return side === "YES" ? yes : 1 - yes;
}

function marketQuestion(marketId: string) {
  return MARKET_BY_ID.get(marketId)?.question ?? marketId;
}

function estimateFee(notionalUsd: number) {
  // mock fee model: 1% with $0.10 min
  const FEE_RATE = 0.01;
  const MIN_FEE = 0.1;
  if (!Number.isFinite(notionalUsd) || notionalUsd <= 0) return 0;
  return Math.max(MIN_FEE, notionalUsd * FEE_RATE);
}

function upsertPosition(marketId: string, side: "YES" | "NO", fillShares: number, fillPrice: number) {
  const positions = [...state.positions];
  const idx = positions.findIndex((p) => p.marketId === marketId && p.side === side && p.status === "OPEN");

  if (idx === -1) {
    const pos: Position = {
      id: `pos-${Date.now()}`,
      marketId,
      question: marketQuestion(marketId),
      side,
      shares: fillShares,
      avgPrice: fillPrice,
      currentYes: side === "YES" ? fillPrice : 1 - fillPrice, // approximate
      status: "OPEN",
    };
    positions.unshift(pos);
  } else {
    const p = positions[idx];
    const newShares = p.shares + fillShares;
    const newAvg = newShares > 0 ? (p.avgPrice * p.shares + fillPrice * fillShares) / newShares : p.avgPrice;
    positions[idx] = { ...p, shares: newShares, avgPrice: newAvg };
  }

  setState({ ...state, positions });
}

function reducePosition(marketId: string, side: "YES" | "NO", sellShares: number) {
  const positions = [...state.positions];
  const idx = positions.findIndex((p) => p.marketId === marketId && p.side === side && p.status === "OPEN");
  if (idx === -1) return false;

  const p = positions[idx];
  if (sellShares > p.shares + 1e-9) return false;

  const remaining = p.shares - sellShares;
  if (remaining <= 1e-9) {
    positions[idx] = { ...p, shares: 0, status: "CLOSED" };
  } else {
    positions[idx] = { ...p, shares: remaining };
  }
  setState({ ...state, positions });
  return true;
}

function addTrade(trade: RecentTrade) {
  const trades = [trade, ...state.trades].slice(0, 300);
  setState({ ...state, trades });
}

function addTx(tx: Transaction) {
  const transactions = [tx, ...state.transactions].slice(0, 300);
  setState({ ...state, transactions });
}

export type PlaceOrderInput = {
  marketId: string;
  yesPrice: number; // current YES price (0..1) — kept for UI usage / future logic
  action: "BUY" | "SELL";
  side: "YES" | "NO";
  orderType: "MARKET" | "LIMIT";
  // for LIMIT, contract price is taken from limitSidePrice; for MARKET, from execSidePrice
  execSidePrice: number; // 0..1 (contract price of selected side)
  limitSidePrice?: number; // 0..1
  shares: number;
};

export const accountActions = {
  reset() {
    setState(seedState());
  },

  deposit(amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) return;
    setState({ ...state, walletCashUsd: state.walletCashUsd + amountUsd });
    addTx({
      id: `tx-${Date.now()}`,
      ts: Date.now(),
      type: "DEPOSIT",
      amountUsd,
      note: "Deposit (mock)",
    });
  },

  withdraw(amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) return false;
    if (amountUsd > state.walletCashUsd + 1e-9) return false;

    setState({ ...state, walletCashUsd: state.walletCashUsd - amountUsd });
    addTx({
      id: `tx-${Date.now()}`,
      ts: Date.now(),
      type: "WITHDRAWAL",
      amountUsd: -amountUsd,
      note: "Withdrawal (mock)",
    });
    return true;
  },

  cancelOrder(orderId: string) {
    const idx = state.openOrders.findIndex((o) => o.id === orderId);
    if (idx === -1) return;

    const o = state.openOrders[idx];
    const openOrders = state.openOrders.filter((x) => x.id !== orderId);

    // Refund reserved collateral (mock model):
    let walletCashUsd = state.walletCashUsd;
    const positions = [...state.positions];

    if (o.reservedCashUsd && o.reservedCashUsd > 0) {
      walletCashUsd += o.reservedCashUsd;
    }
    if (o.reservedShares && o.reservedShares > 0) {
      const pIdx = positions.findIndex((p) => p.marketId === o.marketId && p.side === o.side && p.status === "OPEN");
      if (pIdx !== -1) {
        positions[pIdx] = { ...positions[pIdx], shares: positions[pIdx].shares + o.reservedShares };
      }
    }

    setState({ ...state, openOrders, walletCashUsd, positions });
    addTx({
      id: `tx-${Date.now()}`,
      ts: Date.now(),
      type: "ORDER_CANCEL",
      amountUsd: 0,
      note: `Canceled order ${o.id} (mock)`,
    });
  },

  placeOrder(input: PlaceOrderInput): { ok: boolean; error?: string; orderId?: string } {
    // ✅ removed yesPrice from destructuring to avoid "declared but never read"
    const { marketId, action, side, orderType, shares } = input;

    const sidePrice = clamp01(
      orderType === "LIMIT" ? (input.limitSidePrice ?? input.execSidePrice) : input.execSidePrice
    );

    if (!Number.isFinite(shares) || shares <= 0) return { ok: false, error: "Invalid shares" };
    if (sidePrice <= 0 || sidePrice >= 1) return { ok: false, error: "Invalid price" };

    const notionalUsd = shares * sidePrice;
    const feeUsd = estimateFee(notionalUsd);

    if (orderType === "LIMIT") {
      // Create open order + reserve collateral
      if (action === "BUY") {
        const total = notionalUsd + feeUsd;
        if (total > state.walletCashUsd + 1e-9) return { ok: false, error: "Insufficient balance" };

        const o: OpenOrder = {
          id: `ord-${Date.now()}`,
          marketId,
          action,
          side,
          type: "LIMIT",
          limitPrice: sidePrice,
          shares,
          createdAt: Date.now(),
          reservedCashUsd: total,
        };

        setState({
          ...state,
          walletCashUsd: state.walletCashUsd - total,
          openOrders: [o, ...state.openOrders],
        });

        addTx({
          id: `tx-${Date.now()}`,
          ts: Date.now(),
          type: "ORDER_PLACE",
          amountUsd: 0,
          note: `Placed BUY LIMIT ${side} (reserved ${total.toFixed(2)})`,
        });

        return { ok: true, orderId: o.id };
      }

      // SELL LIMIT: reserve shares by reducing position immediately (mock)
      const pos = state.positions.find((p) => p.marketId === marketId && p.side === side && p.status === "OPEN");
      if (!pos || pos.shares < shares - 1e-9) return { ok: false, error: "Not enough shares" };

      // reduce shares (reserve)
      reducePosition(marketId, side, shares);

      const o: OpenOrder = {
        id: `ord-${Date.now()}`,
        marketId,
        action,
        side,
        type: "LIMIT",
        limitPrice: sidePrice,
        shares,
        createdAt: Date.now(),
        reservedShares: shares,
      };

      setState({ ...state, openOrders: [o, ...state.openOrders] });

      addTx({
        id: `tx-${Date.now()}`,
        ts: Date.now(),
        type: "ORDER_PLACE",
        amountUsd: 0,
        note: `Placed SELL LIMIT ${side} (reserved ${shares.toFixed(2)} shares)`,
      });

      return { ok: true, orderId: o.id };
    }

    // MARKET: fill immediately
    if (action === "BUY") {
      const total = notionalUsd + feeUsd;
      if (total > state.walletCashUsd + 1e-9) return { ok: false, error: "Insufficient balance" };

      setState({ ...state, walletCashUsd: state.walletCashUsd - total });

      upsertPosition(marketId, side, shares, sidePrice);

      addTrade({
        id: `tr-${Date.now()}`,
        marketId,
        ts: Date.now(),
        side,
        price: sidePrice,
        shares,
      });

      addTx({
        id: `tx-${Date.now()}`,
        ts: Date.now(),
        type: "TRADE",
        amountUsd: -notionalUsd,
        note: `Bought ${shares.toFixed(0)} ${side} @ ${(sidePrice * 100).toFixed(0)}¢`,
      });

      addTx({
        id: `tx-${Date.now()}-fee`,
        ts: Date.now(),
        type: "TRADE_FEE",
        amountUsd: -feeUsd,
        note: "Fee (mock)",
      });

      return { ok: true };
    }

    // SELL
    const ok = reducePosition(marketId, side, shares);
    if (!ok) return { ok: false, error: "Not enough shares" };

    const proceeds = Math.max(0, notionalUsd - feeUsd);
    setState({ ...state, walletCashUsd: state.walletCashUsd + proceeds });

    addTrade({
      id: `tr-${Date.now()}`,
      marketId,
      ts: Date.now(),
      side,
      price: sidePrice,
      shares,
    });

    addTx({
      id: `tx-${Date.now()}`,
      ts: Date.now(),
      type: "TRADE",
      amountUsd: proceeds,
      note: `Sold ${shares.toFixed(0)} ${side} @ ${(sidePrice * 100).toFixed(0)}¢`,
    });

    addTx({
      id: `tx-${Date.now()}-fee`,
      ts: Date.now(),
      type: "TRADE_FEE",
      amountUsd: -feeUsd,
      note: "Fee (mock)",
    });

    return { ok: true };
  },

  // helpful selectors for UI
  getPosition(marketId: string) {
    return state.positions.find((p) => p.marketId === marketId && p.status === "OPEN") ?? null;
  },

  getPositionForSide(marketId: string, side: "YES" | "NO") {
    return state.positions.find((p) => p.marketId === marketId && p.side === side && p.status === "OPEN") ?? null;
  },

  impliedMarkFromYes(yesPrice: number, side: "YES" | "NO") {
    return sidePriceFromYes(yesPrice, side);
  },
};

export function useAccountStore<T>(selector: (s: AccountState) => T): T {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);

  const getSnapshot = useCallback(() => state, []);
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(s);
}
