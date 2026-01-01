import { Box, Divider, Paper, Stack, Typography, Chip } from "@mui/material";
import type { RecentTrade } from "../data/mockMarketExtras";

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function RecentTrades({ trades }: { trades: RecentTrade[] }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={0.75}>
        <Typography variant="h6">Recent trades</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Time & sales (mock)
        </Typography>
      </Stack>

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: "grid", gap: 0.75 }}>
        {trades.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No recent trades.
          </Typography>
        ) : (
          trades.slice(0, 16).map((t) => (
            <Box
              key={t.id}
              sx={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 90px", gap: 1, alignItems: "center" }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {fmtTime(t.ts)}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip size="small" label={t.side} color={t.side === "YES" ? "primary" : "error"} variant="outlined" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {Math.round(t.price * 100)}¢
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 700 }}>
                {t.shares.toFixed(0)}
              </Typography>

              <Typography variant="body2" sx={{ textAlign: "right", color: "text.secondary" }}>
                ${(t.price * t.shares).toFixed(2)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}
