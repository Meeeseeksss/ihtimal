import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export type ConfirmTradePayload = {
  marketId: string;
  action: "BUY" | "SELL";
  side: "YES" | "NO";
  orderType: "MARKET" | "LIMIT";

  execSidePrice: number; // 0..1
  limitSidePrice?: number; // 0..1

  shares: number;
  notionalUsd: number;
  feeUsd: number;

  totalCostUsd?: number; // BUY only
  netProceedsUsd?: number; // SELL only

  walletCashUsd: number;
  positionSharesBefore: number;
};

function fmtUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function fmtCents(p: number) {
  return `${Math.round(p * 100)}¢`;
}

export function ConfirmTradeDialog({
  open,
  onClose,
  payload,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  payload: ConfirmTradePayload;
  onConfirm: (p: ConfirmTradePayload) => void;
}) {
  const actionLabel = `${payload.action === "BUY" ? "Buy" : "Sell"} ${payload.side}`;
  const typeLabel = payload.orderType === "MARKET" ? "Market" : "Limit";

  const balanceAfter =
    payload.action === "BUY" && payload.totalCostUsd != null
      ? payload.walletCashUsd - payload.totalCostUsd
      : payload.action === "SELL" && payload.netProceedsUsd != null
        ? payload.walletCashUsd + payload.netProceedsUsd
        : null;

  const sharesAfter =
    payload.action === "SELL" ? payload.positionSharesBefore - payload.shares : payload.positionSharesBefore;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 850 }}>Review order</DialogTitle>

      <DialogContent sx={{ display: "grid", gap: 1.25 }}>
        <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Action:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 900 }}>
            {actionLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • {typeLabel}
          </Typography>
          {payload.orderType === "LIMIT" && payload.limitSidePrice != null && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              • Limit {fmtCents(payload.limitSidePrice)}
            </Typography>
          )}
        </Stack>

        <Divider />

        <Stack spacing={0.6}>
          <Line label="Estimated price" value={fmtCents(payload.execSidePrice)} />
          <Line label="Shares" value={payload.shares.toFixed(2)} />
          <Line label="Notional" value={fmtUsd(payload.notionalUsd)} />
          <Line label="Estimated fee" value={fmtUsd(payload.feeUsd)} />
          {payload.action === "BUY" && payload.totalCostUsd != null && (
            <Line label="Total cost" value={fmtUsd(payload.totalCostUsd)} />
          )}
          {payload.action === "SELL" && payload.netProceedsUsd != null && (
            <Line label="Net proceeds" value={fmtUsd(payload.netProceedsUsd)} />
          )}

          <Divider sx={{ my: 0.5 }} />

          <Line label="Balance (now)" value={fmtUsd(payload.walletCashUsd)} />
          {balanceAfter != null && <Line label="Balance (after)" value={fmtUsd(balanceAfter)} />}
          <Line label="Shares (now)" value={payload.positionSharesBefore.toFixed(2)} />
          <Line label="Shares (after)" value={Math.max(0, sharesAfter).toFixed(2)} />
        </Stack>

        <Alert severity="info" variant="outlined">
          This is a mock trading flow. Market orders fill immediately; limit orders become “Open orders”.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onConfirm(payload)}>
          Place order
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 850 }}>
        {value}
      </Typography>
    </Stack>
  );
}
