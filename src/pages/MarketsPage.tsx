import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { MarketCard } from "../components/MarketCard";
import { SecondaryNav } from "../layout/SecondaryNav";
import { TopicBubbles } from "../components/TopicBubbles";
import { MarketFilters } from "../components/MarketFilters";
import type { MarketFilterState } from "../components/MarketFilters";
import { MarketCardSkeleton } from "../components/MarketCardSkeleton";
import { useMarkets } from "../data/marketsApi";
import { sortMarkets, type MarketSortKey } from "../data/marketSort";

export function MarketsPage() {
  const marketsQ = useMarkets();

  const [filters, setFilters] = useState<MarketFilterState>({
    query: "",
    status: "ALL",
    category: "ALL",
    minVolume: 0,
  });

  const [sort, setSort] = useState<MarketSortKey>("TRENDING");

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
        <MarketFilters value={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
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
