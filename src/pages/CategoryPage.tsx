import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SecondaryNav } from "../layout/SecondaryNav";
import { TopicBubbles } from "../components/TopicBubbles";
import { MarketFilters, type MarketFilterState } from "../components/MarketFilters";
import { MarketCard } from "../components/MarketCard";
import { MarketCardSkeleton } from "../components/MarketCardSkeleton";
import type { MarketCategory } from "../data/mockMarkets";
import { useMarketsByCategory } from "../data/marketsApi";
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

function isMarketCategory(x: unknown): x is MarketCategory {
  return x === "CRYPTO" || x === "POLITICS" || x === "SPORTS";
}

export function CategoryPage() {
  const { category } = useParams();
  const parsedCategory: MarketCategory | null = isMarketCategory(category) ? category : null;

  const [filters, setFilters] = useState<MarketFilterState>({
    query: "",
    status: "ALL",
    category: parsedCategory ?? "ALL",
    minVolume: 0,
  });

  const [sort, setSort] = useState<MarketSortKey>("TRENDING");

  const { data, isLoading, isError } = useMarketsByCategory(parsedCategory ?? undefined);

  const filteredAndSorted = useMemo(() => {
    const markets = data ?? [];

    const filtered = markets.filter((m) => {
      if (filters.status !== "ALL" && m.status !== filters.status) return false;
      if (filters.minVolume > 0 && m.volumeUsd < filters.minVolume) return false;
      if (filters.query && !m.question.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    });

    return sortMarkets(filtered, sort);
  }, [data, filters, sort]);

  if (!parsedCategory) {
    return (
      <Box sx={{ pt: 2 }}>
        <Typography variant="h6">Category not found.</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Expected one of: CRYPTO, POLITICS, SPORTS.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 1, width: "100%" }}>
      <SecondaryNav />
      <TopicBubbles />

      <Box sx={{ my: 2 }}>
        <MarketFilters
          value={{ ...filters, category: parsedCategory }}
          onChange={(next) => setFilters({ ...next, category: parsedCategory })}
          sort={sort}
          onSortChange={setSort}
          // disableCategory
          // resultCount={isLoading ? undefined : filteredAndSorted.length}
        />
      </Box>

      {isError ? (
        <Typography variant="body2" sx={{ color: "error.main" }}>
          Failed to load markets.
        </Typography>
      ) : (
        <Box sx={GRID_SX}>
          {isLoading
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
  );
}
