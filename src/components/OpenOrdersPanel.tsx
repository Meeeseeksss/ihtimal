import { Box, Button, Divider, Paper, Stack, Typography, Chip } from "@mui/material";
import type { OpenOrder } from "../data/mockMarketExtras";

export function OpenOrdersPanel({
  orders,
  onCancelOrder,
}: {
  orders: OpenOrder[];
  onCancelOrder: (orderId: string) => void;
}) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={0.75}>
        <Typography variant="h6">Open orders</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Mock limit orders (cancel refunds reserved collateral)
        </Typography>
      </Stack>

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: "grid", gap: 0.75 }}>
        {orders.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            You have no open orders.
          </Typography>
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
