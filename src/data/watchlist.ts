import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "kalshiClone.watchlist.marketIds";

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>(() => readIds());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== KEY) return;
      setIds(readIds());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = useMemo(() => new Set(ids), [ids]);

  const isWatched = useCallback((marketId: string) => set.has(marketId), [set]);

  const toggle = useCallback((marketId: string) => {
    setIds((prev) => {
      const has = prev.includes(marketId);
      const next = has ? prev.filter((x) => x !== marketId) : [marketId, ...prev];
      writeIds(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeIds([]);
    setIds([]);
  }, []);

  return { ids, isWatched, toggle, clear };
}
