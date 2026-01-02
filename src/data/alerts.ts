import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * UI-only alert settings (localStorage) for watched markets.
 * This is intentionally lightweight until a backend / push system exists.
 */

export type MarketAlertConfig = {
  enabled: boolean;
  /** Notify when market is within N hours of close. */
  closeSoonHours?: number;
  /** Notify when YES probability crosses above this (0..1). */
  yesAbove?: number;
  /** Notify when YES probability crosses below this (0..1). */
  yesBelow?: number;
};

export type AlertsByMarketId = Record<string, MarketAlertConfig>;

const KEY_CFG = "kalshiClone.alerts.config.v1";
const KEY_FIRED = "kalshiClone.alerts.fired.v1";

type FiredMap = Record<string, number>; // key => ts

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readCfg(): AlertsByMarketId {
  const parsed = safeParse<AlertsByMarketId>(typeof window === "undefined" ? null : localStorage.getItem(KEY_CFG));
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function writeCfg(cfg: AlertsByMarketId) {
  try {
    localStorage.setItem(KEY_CFG, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

function readFired(): FiredMap {
  const parsed = safeParse<FiredMap>(typeof window === "undefined" ? null : localStorage.getItem(KEY_FIRED));
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function writeFired(map: FiredMap) {
  try {
    localStorage.setItem(KEY_FIRED, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function numOrUndef(v: unknown): number | undefined {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export function useMarketAlerts() {
  const [cfg, setCfg] = useState<AlertsByMarketId>(() => readCfg());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== KEY_CFG) return;
      setCfg(readCfg());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setForMarket = useCallback((marketId: string, next: MarketAlertConfig | null) => {
    setCfg((prev) => {
      const copy: AlertsByMarketId = { ...prev };
      if (next == null) delete copy[marketId];
      else copy[marketId] = next;
      writeCfg(copy);
      return copy;
    });
  }, []);

  const getForMarket = useCallback(
    (marketId: string): MarketAlertConfig => {
      const c = cfg[marketId];
      return c ?? { enabled: false };
    },
    [cfg]
  );

  const enabledCount = useMemo(() => Object.values(cfg).filter((c) => c && c.enabled).length, [cfg]);

  return { cfg, setForMarket, getForMarket, enabledCount };
}

export type AlertHit = {
  key: string;
  message: string;
};

/**
 * Evaluate alert hits for a single market.
 * Caller is responsible for deciding where/when to show notifications.
 */
export function evaluateMarketAlerts(opts: {
  marketId: string;
  question: string;
  yesPrice: number; // 0..1
  resolvesAt: number; // epoch ms
  status: string;
  cfg: MarketAlertConfig;
  now?: number;
  cooldownMs?: number;
}): AlertHit[] {
  const {
    marketId,
    question,
    yesPrice,
    resolvesAt,
    status,
    cfg,
    now = Date.now(),
    cooldownMs = 1000 * 60 * 60, // 1h
  } = opts;

  if (!cfg.enabled) return [];
  if (status !== "TRADING") return [];

  const fired = readFired();
  const hits: AlertHit[] = [];

  const yes = clamp01(yesPrice);

  // Close soon
  const closeSoonHours = numOrUndef(cfg.closeSoonHours);
  if (closeSoonHours != null && closeSoonHours > 0) {
    const msLeft = resolvesAt - now;
    if (msLeft > 0 && msLeft <= closeSoonHours * 60 * 60 * 1000) {
      const key = `${marketId}:closeSoon:${closeSoonHours}`;
      const last = fired[key] ?? 0;
      if (now - last >= cooldownMs) {
        hits.push({
          key,
          message: `Closing soon: ${question}`,
        });
      }
    }
  }

  // YES above
  const yesAbove = numOrUndef(cfg.yesAbove);
  if (yesAbove != null && yesAbove > 0 && yesAbove < 1) {
    if (yes >= yesAbove) {
      const key = `${marketId}:yesAbove:${yesAbove}`;
      const last = fired[key] ?? 0;
      if (now - last >= cooldownMs) {
        hits.push({
          key,
          message: `YES ≥ ${Math.round(yesAbove * 100)}%: ${question}`,
        });
      }
    }
  }

  // YES below
  const yesBelow = numOrUndef(cfg.yesBelow);
  if (yesBelow != null && yesBelow > 0 && yesBelow < 1) {
    if (yes <= yesBelow) {
      const key = `${marketId}:yesBelow:${yesBelow}`;
      const last = fired[key] ?? 0;
      if (now - last >= cooldownMs) {
        hits.push({
          key,
          message: `YES ≤ ${Math.round(yesBelow * 100)}%: ${question}`,
        });
      }
    }
  }

  if (hits.length) {
    const next = { ...fired };
    for (const h of hits) next[h.key] = now;
    writeFired(next);
  }

  return hits;
}
