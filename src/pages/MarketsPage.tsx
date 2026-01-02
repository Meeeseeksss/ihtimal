import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MarketCard } from "../components/MarketCard";
import { SecondaryNav } from "../layout/SecondaryNav";
import { TopicBubbles } from "../components/TopicBubbles";
import { MarketFilters } from "../components/MarketFilters";
import type { MarketFilterState } from "../components/MarketFilters";
import { MarketCardSkeleton } from "../components/MarketCardSkeleton";
import { useMarkets } from "../data/marketsApi";
import { sanitizeSort, sortMarkets, type MarketSortKey } from "../data/marketSort";

function parseIntSafe(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function sanitizeStatus(v: unknown): MarketFilterState["status"] {
  return v === "TRADING" || v === "HALTED" || v === "RESOLVED" ? v : "ALL";
}

function sanitizeCategory(v: unknown): MarketFilterState["category"] {
  return v === "CRYPTO" || v === "POLITICS" || v === "SPORTS" ? v : "ALL";
}

export function MarketsPage() {
  const marketsQ = useMarkets();
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<MarketFilterState>({
    query: "",
    status: "ALL",
    category: "ALL",
    minVolume: 0,
  });

  const [sort, setSort] = useState<MarketSortKey>("TRENDING");

  // Avoid state<->URL feedback loops
  const applyingUrlRef = useRef(false);
  const queryDebounceRef = useRef<number | null>(null);

  // URL -> state (supports /markets?q=... from TopNav)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);

    const q = sp.get("q") ?? "";
    const status = sanitizeStatus(sp.get("status"));
    const category = sanitizeCategory(sp.get("category"));
    const minVolRaw = parseIntSafe(sp.get("minVol"));
    const minVolume = minVolRaw != null && minVolRaw > 0 ? minVolRaw : 0;
    const sortKey = sanitizeSort(sp.get("sort"));

    const nextFilters: MarketFilterState = {
      query: q,
      status,
      category,
      minVolume,
    };

    const filtersChanged =
      nextFilters.query !== filters.query ||
      nextFilters.status !== filters.status ||
      nextFilters.category !== filters.category ||
      nextFilters.minVolume !== filters.minVolume;

    const sortChanged = sortKey !== sort;

    if (!filtersChanged && !sortChanged) return;

    applyingUrlRef.current = true;
    setFilters(nextFilters);
    setSort(sortKey);

    const t = window.setTimeout(() => {
      applyingUrlRef.current = false;
    }, 0);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // state -> URL (shareable/filterable Markets page)
  useEffect(() => {
    if (applyingUrlRef.current) return;

    // Debounce only the free-text query.
    if (queryDebounceRef.current) window.clearTimeout(queryDebounceRef.current);

    queryDebounceRef.current = window.setTimeout(() => {
      const sp = new URLSearchParams(location.search);

      // query
      if (filters.query.trim()) sp.set("q", filters.query.trim());
      else sp.delete("q");

      // status
      if (filters.status !== "ALL") sp.set("status", filters.status);
      else sp.delete("status");

      // category
      if (filters.category !== "ALL") sp.set("category", filters.category);
      else sp.delete("category");

      // min volume
      if (filters.minVolume > 0) sp.set("minVol", String(filters.minVolume));
      else sp.delete("minVol");

      // sort
      if (sort !== "TRENDING") sp.set("sort", sort);
      else sp.delete("sort");

      const nextSearch = sp.toString();
      const currentSearch = location.search.startsWith("?") ? location.search.slice(1) : location.search;

      if (nextSearch === currentSearch) return;

      navigate({ pathname: "/markets", search: nextSearch ? `?${nextSearch}` : "" }, { replace: true });
    }, 250);

    return () => {
      if (queryDebounceRef.current) window.clearTimeout(queryDebounceRef.current);
    };
  }, [filters, sort, location.search, navigate]);

  const filteredAndSorted = useMemo(() => {
    const markets = marketsQ.data ?? [];

    const filtered = markets.filter((m) => {
      if (filters.status !== "ALL" && m.status !== filters.status) return false;
      if (filters.category !== "ALL" && m.category !== filters.category) return false;
      if (filters.minVolume > 0 && m.volumeUsd < filters.minVolume) return false;
      if (filters.query && !m.question.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    });

    return sortMarkets(filtered, sort);
  }, [filters, marketsQ.data, sort]);

  return (
    <Box sx={{ pt: 1, width: "100%" }}>
      <SecondaryNav />
      <TopicBubbles />

      <Box sx={{ my: 2 }}>
        <MarketFilters
          value={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          resultCount={marketsQ.isLoading ? undefined : filteredAndSorted.length}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 0.6,
          alignItems: "stretch",
        }}
      >
        {marketsQ.isError ? (
          <Typography variant="body2" sx={{ color: "error.main", px: 2 }}>
            Failed to load markets.
          </Typography>
        ) : marketsQ.isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <Box key={i} sx={{ minWidth: 0 }}>
              <MarketCardSkeleton />
            </Box>
          ))
        ) : filteredAndSorted.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              No results
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Try a different search, loosen filters, or clear everything.
            </Typography>
          </Box>
        ) : (
          filteredAndSorted.map((m) => (
            <Box key={m.id} sx={{ minWidth: 0 }}>
              <MarketCard
                market={m}
                sx={{
                  borderRadius: 0.125,
                  boxShadow: "none",
                  border: 1,
                  borderColor: "divider",
                  "&:hover": { boxShadow: "none", filter: "brightness(0.98)" },
                }}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
