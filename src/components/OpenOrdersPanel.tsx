import { Box, Button, Divider, Paper, Stack, Typography, Chip } from "@mui/material";
import type { OpenOrder } from "../data/mockMarketExtras";

export function OpenOrdersPanel({
  orders,
  onCancelOrder,
  dense,
}: {
  orders: OpenOrder[];
  onCancelOrder: (orderId: string) => void;
  /** Use a tighter layout (for side-by-side placements). */
  dense?: boolean;
}) {
  const p = dense ? 1.5 : 2;
  const headerGap = dense ? 0.35 : 0.75;
  const dividerMy = dense ? 1 : 1.25;
  const cardPad = dense ? 0.85 : 1;

  return (
    <Paper sx={{ p }}>
      <Stack spacing={headerGap}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
          <Typography variant={dense ? "subtitle1" : "h6"} sx={{ fontWeight: 900 }}>
            Open orders
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {orders.length}
          </Typography>
        </Box>

        {!dense ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Mock limit orders (cancel refunds reserved collateral)
          </Typography>
        ) : null}
      </Stack>

      <Divider sx={{ my: dividerMy }} />

      <Box sx={{ display: "grid", gap: dense ? 0.6 : 0.75 }}>
        {orders.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            You have no open orders.
          </Typography>
        ) : dense ? (
          orders.map((o) => (
            <Box
              key={o.id}
              sx={{
                p: cardPad,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gap: 0.6,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Chip
                    size="small"
                    label={`${o.action} ${o.side}`}
                    color={o.side === "YES" ? "primary" : "error"}
                    variant="outlined"
                  />
                  <Chip size="small" label={o.type} variant="outlined" />
                </Stack>

                <Typography variant="body2" sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                  {Math.round(o.limitPrice * 100)}¢
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {o.shares.toFixed(0)} shares
                </Typography>
                <Button size="small" variant="outlined" onClick={() => onCancelOrder(o.id)}>
                  Cancel
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Placed {new Date(o.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))
        ) : (
          orders.map((o) => (
            <Box
              key={o.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 90px 110px",
                gap: 1,
                alignItems: "center",
                p: 1,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip
                    size="small"
                    label={`${o.action} ${o.side}`}
                    color={o.side === "YES" ? "primary" : "error"}
                    variant="outlined"
                  />
                  <Chip size="small" label={o.type} variant="outlined" />
                </Stack>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Placed {new Date(o.createdAt).toLocaleString()}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 800 }}>
                {Math.round(o.limitPrice * 100)}¢
              </Typography>

              <Typography variant="body2" sx={{ textAlign: "right" }}>
                {o.shares.toFixed(0)}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" variant="outlined" onClick={() => onCancelOrder(o.id)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}
