import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { Position } from "../data/mockMarketExtras";

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function fmtUsd(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function sidePriceFromYes(yesPrice: number, side: "YES" | "NO") {
  const yes = clamp01(yesPrice);
  return side === "YES" ? yes : 1 - yes;
}

export function PositionWidget({
  position,
  currentYesPrice,
  onExit,
}: {
  position: Position;
  currentYesPrice: number;
  onExit: (side: "YES" | "NO") => void;
}) {
  const mark = sidePriceFromYes(currentYesPrice, position.side);
  const pnl = (mark - position.avgPrice) * position.shares;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Stack spacing={1}>
        <Typography variant="h6">Your position</Typography>
        <Divider />

        <Box sx={{ display: "grid", gap: 0.5 }}>
          <Row label="Side" value={position.side} strong />
          <Row label="Shares" value={position.shares.toFixed(2)} />
          <Row label="Avg price" value={`${Math.round(position.avgPrice * 100)}¢`} />
          <Row label="Mark" value={`${Math.round(mark * 100)}¢`} />
          <Row
            label="Unrealized P&L"
            value={fmtUsd(pnl)}
            valueSx={{
              fontWeight: 900,
              color: pnl > 0 ? "success.main" : pnl < 0 ? "error.main" : "text.primary",
            }}
          />
        </Box>

        <Button variant="contained" onClick={() => onExit(position.side)} sx={{ mt: 0.5 }}>
          Exit ({position.side})
        </Button>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Mock positions. Exit pre-fills the ticket to Sell.
        </Typography>
      </Stack>
    </Paper>
  );
}

function Row({
  label,
  value,
  strong,
  valueSx,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueSx?: Record<string, any>;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 900 : 800, ...(valueSx ?? {}) }}>
        {value}
      </Typography>
    </Box>
  );
}
