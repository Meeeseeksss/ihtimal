import { Box, Divider, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SecondaryNav } from "../layout/SecondaryNav";
import { TopicBubbles } from "../components/TopicBubbles";
import { MarketFilters, type MarketFilterState } from "../components/MarketFilters";
import { MarketCard } from "../components/MarketCard";
import { MarketCardSkeleton } from "../components/MarketCardSkeleton";
import { useCollection, useMarketsByIds } from "../data/marketsApi";
import { sortMarkets, type MarketSortKey } from "../data/marketSort";

const GRID_SX = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(1, minmax(0, 1fr))",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 0.6,
  alignItems: "stretch",
} as const;

export function CollectionDetailPage() {
  const { id } = useParams();
  const collectionQ = useCollection(id);

  const marketIds = collectionQ.data?.marketIds;
  const marketsQ = useMarketsByIds(marketIds);

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
  }, [marketsQ.data, filters, sort]);

  if (collectionQ.isError) {
    return (
      <Box sx={{ pt: 2 }}>
        <Typography variant="h6" sx={{ color: "error.main" }}>
          Failed to load collection.
        </Typography>
      </Box>
    );
  }

  if (!collectionQ.isLoading && !collectionQ.data) {
    return (
      <Box sx={{ pt: 2 }}>
        <Typography variant="h6">Collection not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 1, width: "100%" }}>
      <SecondaryNav />
      <TopicBubbles />

      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Typography variant="h5">{collectionQ.isLoading ? "Loading…" : collectionQ.data?.title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {collectionQ.isLoading ? "" : collectionQ.data?.description}
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <MarketFilters value={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
        </Box>

        {marketsQ.isError ? (
          <Typography variant="body2" sx={{ color: "error.main" }}>
            Failed to load markets.
          </Typography>
        ) : (
          <Box sx={GRID_SX}>
            {(collectionQ.isLoading || marketsQ.isLoading)
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Box key={i} sx={{ minWidth: 0 }}>
                    <MarketCardSkeleton />
                  </Box>
                ))
              : filteredAndSorted.map((m) => (
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
                ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
