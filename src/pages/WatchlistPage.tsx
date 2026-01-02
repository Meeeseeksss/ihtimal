import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Card,
  CardContent,
  Switch,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useMemo } from "react";
import { mockMarkets } from "../data/mockMarkets";
import { useWatchlist } from "../data/watchlist";
import { MarketCard } from "../components/MarketCard";
import { useMarketAlerts } from "../data/alerts";

export function WatchlistPage() {
  const { ids, clear } = useWatchlist();
  const { getForMarket, setForMarket, enabledCount } = useMarketAlerts();

  const markets = useMemo(() => {
    const set = new Set(ids);
    return mockMarkets.filter((m) => set.has(m.id));
  }, [ids]);

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
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
        <>
          {/* P2: lightweight alerts UI (localStorage) */}
          <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent sx={{ display: "grid", gap: 1 }}>
              <Typography variant="h6">Alerts (mock)</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Alerts fire while the app is open. They are stored locally and currently only support watched markets.
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Enabled: {enabledCount}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: "grid", gap: 1 }}>
                {markets.slice(0, 12).map((m) => {
                  const cfg = getForMarket(m.id);
                  const closeSoonHours = cfg.closeSoonHours ?? 0;
                  const yesAbove = cfg.yesAbove ?? 0;
                  const yesBelow = cfg.yesBelow ?? 0;

                  return (
                    <Box
                      key={m.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.8fr" },
                        gap: 1,
                        alignItems: "start",
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {m.question}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          YES {Math.round(m.yesPrice * 100)}% • closes {new Date(m.resolvesAt).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "grid", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            Enable
                          </Typography>
                          <Switch
                            checked={Boolean(cfg.enabled)}
                            onChange={(e) => {
                              const enabled = e.target.checked;
                              setForMarket(m.id, {
                                ...cfg,
                                enabled,
                              });
                            }}
                          />
                        </Box>

                        <TextField
                          size="small"
                          label="Close soon (hours)"
                          value={closeSoonHours ? String(closeSoonHours) : ""}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setForMarket(m.id, {
                              ...cfg,
                              enabled: cfg.enabled ?? false,
                              closeSoonHours: Number.isFinite(n) && n > 0 ? n : undefined,
                            });
                          }}
                          inputMode="numeric"
                          disabled={!cfg.enabled}
                        />

                        <TextField
                          size="small"
                          label="YES above (%)"
                          value={yesAbove ? String(Math.round(yesAbove * 100)) : ""}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            const v = Number.isFinite(n) ? n / 100 : NaN;
                            setForMarket(m.id, {
                              ...cfg,
                              enabled: cfg.enabled ?? false,
                              yesAbove: Number.isFinite(v) && v > 0 && v < 1 ? v : undefined,
                            });
                          }}
                          inputMode="numeric"
                          disabled={!cfg.enabled}
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />

                        <TextField
                          size="small"
                          label="YES below (%)"
                          value={yesBelow ? String(Math.round(yesBelow * 100)) : ""}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            const v = Number.isFinite(n) ? n / 100 : NaN;
                            setForMarket(m.id, {
                              ...cfg,
                              enabled: cfg.enabled ?? false,
                              yesBelow: Number.isFinite(v) && v > 0 && v < 1 ? v : undefined,
                            });
                          }}
                          inputMode="numeric"
                          disabled={!cfg.enabled}
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

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
        </>
      )}
    </Box>
  );
}
