import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { mockMarkets } from "../data/mockMarkets";
import { useWatchlist } from "../data/watchlist";
import { MarketCard } from "../components/MarketCard";

export function WatchlistPage() {
  const { ids, clear } = useWatchlist();

  const markets = useMemo(() => {
    const set = new Set(ids);
    return mockMarkets.filter((m) => set.has(m.id));
  }, [ids]);

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5">Watchlist</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Star markets to track them here.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={clear} disabled={ids.length === 0}>
          Clear watchlist
        </Button>
      </Stack>

      <Divider />

      {markets.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Your watchlist is empty. Tap the ☆ on a market card to add it.
        </Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            gap: 0.6,
            alignItems: "stretch",
          }}
        >
          {markets.map((m) => (
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
