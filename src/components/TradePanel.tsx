import {
  Box,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TextField,
  Stack,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ConfirmTradeDialog, type ConfirmTradePayload } from "./ConfirmTradeDialog";
import { useNotify } from "../app/notifications";
import { accountActions, useAccountStore } from "../data/accountStore";
import type { OrderBook } from "../data/mockMarketExtras";

type OrderType = "MARKET" | "LIMIT";
type Side = "YES" | "NO";
type Action = "BUY" | "SELL";
type AmountMode = "USD" | "SHARES";

export type TradePreset = {
  action?: Action;
  side?: Side;
  orderType?: OrderType;
  amountMode?: AmountMode;
  autoMax?: boolean;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function fmtCents(p: number) {
  return `${Math.round(p * 100)}¢`;
}
function parsePositive(s: string) {
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

const FEE_RATE = 0.01;
const MIN_FEE = 0.1;
function estimateFee(notionalUsd: number) {
  if (!Number.isFinite(notionalUsd) || notionalUsd <= 0) return 0;
  return Math.max(MIN_FEE, notionalUsd * FEE_RATE);
}

// Solve notional such that notional + fee(notional) <= balance
function maxNotionalForBalance(balance: number) {
  if (balance <= MIN_FEE) return 0;
  let notional = balance / (1 + FEE_RATE);
  let fee = estimateFee(notional);
  if (fee === MIN_FEE) notional = balance - MIN_FEE;
  if (notional + estimateFee(notional) > balance) notional = Math.max(0, notional - 0.01);
  return Math.max(0, notional);
}

export function TradePanel({
  marketId,
  yesPrice,
  orderBook,
  isTradingDisabled,
  tradingDisabledReason,
  onRequestClose,
  presetKey,
  preset,
}: {
  marketId: string;
  yesPrice: number;
  orderBook?: OrderBook;

  /** When true, disables the ticket (e.g. market halted / resolved). */
  isTradingDisabled?: boolean;
  /** Optional copy shown when trading is disabled. */
  tradingDisabledReason?: string;

  onRequestClose?: () => void;

  presetKey?: number;
  preset?: TradePreset;
}) {
  const notify = useNotify();

  const walletCashUsd = useAccountStore((s) => s.walletCashUsd);
  const posYes = useAccountStore(
    (s) => s.positions.find((p) => p.marketId === marketId && p.side === "YES" && p.status === "OPEN") ?? null
  );
  const posNo = useAccountStore(
    (s) => s.positions.find((p) => p.marketId === marketId && p.side === "NO" && p.status === "OPEN") ?? null
  );

  const [action, setAction] = useState<Action>("BUY");
  const [side, setSide] = useState<Side>("YES");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [amountMode, setAmountMode] = useState<AmountMode>("USD");

  const [usd, setUsd] = useState("25");
  const [sharesInput, setSharesInput] = useState("");
  const [limitCents, setLimitCents] = useState(
    String(Math.round((side === "YES" ? yesPrice : 1 - yesPrice) * 100))
  );

  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    setLimitCents(String(Math.round((side === "YES" ? yesPrice : 1 - yesPrice) * 100)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  // Apply preset when key changes
  useEffect(() => {
    if (!preset || presetKey == null) return;
    if (preset.action) setAction(preset.action);
    if (preset.side) setSide(preset.side);
    if (preset.orderType) setOrderType(preset.orderType);
    if (preset.amountMode) setAmountMode(preset.amountMode);
    if (preset.autoMax) setTimeout(() => handleMax(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  // Best execution price proxy using YES book
  const bestAskYes = orderBook?.asks?.[0]?.price;
  const bestBidYes = orderBook?.bids?.[0]?.price;

  const marketSidePrice = useMemo(() => {
    if (action === "BUY") {
      if (side === "YES") return bestAskYes ?? yesPrice;
      // Buy NO ~ 1 - bestBidYes
      return clamp01(1 - (bestBidYes ?? yesPrice));
    }
    // SELL
    if (side === "YES") return bestBidYes ?? yesPrice;
    // Sell NO ~ 1 - bestAskYes
    return clamp01(1 - (bestAskYes ?? yesPrice));
  }, [action, side, bestAskYes, bestBidYes, yesPrice]);

  const limitSidePrice = useMemo(() => clamp01(Number(limitCents || 0) / 100), [limitCents]);

  const execSidePrice = orderType === "MARKET" ? clamp01(marketSidePrice) : limitSidePrice;

  const inputUsd = parsePositive(usd);
  const inputShares = parsePositive(sharesInput);

  const shares = useMemo(() => {
    if (amountMode === "SHARES") return inputShares;
    if (execSidePrice <= 0) return 0;
    return inputUsd / execSidePrice;
  }, [amountMode, inputShares, inputUsd, execSidePrice]);

  const notionalUsd = useMemo(() => shares * execSidePrice, [shares, execSidePrice]);
  const feeUsd = useMemo(() => estimateFee(notionalUsd), [notionalUsd]);

  const totalCostUsd = useMemo(
    () => (action === "BUY" ? notionalUsd + feeUsd : undefined),
    [action, notionalUsd, feeUsd]
  );
  const netProceedsUsd = useMemo(
    () => (action === "SELL" ? Math.max(0, notionalUsd - feeUsd) : undefined),
    [action, notionalUsd, feeUsd]
  );

  const positionSharesBefore = useMemo(() => {
    if (side === "YES") return posYes?.shares ?? 0;
    return posNo?.shares ?? 0;
  }, [side, posYes, posNo]);

  const disabledReason = useMemo(() => {
    if (isTradingDisabled) return tradingDisabledReason || "Trading disabled";
    if (!Number.isFinite(shares) || shares <= 0) return "Enter an amount";
    if (orderType === "LIMIT") {
      if (!Number.isFinite(limitSidePrice) || limitSidePrice <= 0 || limitSidePrice >= 1)
        return "Enter a valid limit price";
    }
    if (action === "BUY") {
      if (totalCostUsd != null && totalCostUsd > walletCashUsd + 1e-9) return "Insufficient balance";
    } else {
      if (positionSharesBefore <= 0) return `No ${side} shares`;
      if (shares > positionSharesBefore + 1e-9) return "Not enough shares";
    }
    return null;
  }, [
    isTradingDisabled,
    tradingDisabledReason,
    shares,
    orderType,
    limitSidePrice,
    action,
    totalCostUsd,
    walletCashUsd,
    positionSharesBefore,
    side,
  ]);

  function handleMax() {
    if (action === "BUY") {
      const maxNotional = maxNotionalForBalance(walletCashUsd);
      if (amountMode === "USD") {
        setUsd(maxNotional.toFixed(2));
      } else {
        const maxShares = execSidePrice > 0 ? maxNotional / execSidePrice : 0;
        setSharesInput(maxShares > 0 ? maxShares.toFixed(2) : "");
      }
      return;
    }

    // SELL
    if (amountMode === "SHARES") {
      setSharesInput(positionSharesBefore > 0 ? positionSharesBefore.toFixed(2) : "");
    } else {
      const maxNotional = positionSharesBefore * execSidePrice;
      setUsd(maxNotional > 0 ? maxNotional.toFixed(2) : "");
    }
  }

  const confirmPayload: ConfirmTradePayload = {
    marketId,
    action,
    side,
    orderType,
    execSidePrice,
    limitSidePrice: orderType === "LIMIT" ? limitSidePrice : undefined,
    shares,
    notionalUsd,
    feeUsd,
    totalCostUsd,
    netProceedsUsd,
    walletCashUsd,
    positionSharesBefore,
  };

  return (
    <>
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography variant="h6">Trade</Typography>

          <ToggleButtonGroup value={action} exclusive onChange={(_, v) => v && setAction(v)} fullWidth size="small">
            <ToggleButton value="BUY">Buy</ToggleButton>
            <ToggleButton value="SELL">Sell</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={side} exclusive onChange={(_, v) => v && setSide(v)} fullWidth>
            <ToggleButton value="YES" color="success">
              {action === "BUY" ? "YES" : "Sell YES"}
            </ToggleButton>
            <ToggleButton value="NO" color="error">
              {action === "BUY" ? "NO" : "Sell NO"}
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={orderType} exclusive onChange={(_, v) => v && setOrderType(v)} fullWidth size="small">
            <ToggleButton value="MARKET">Market</ToggleButton>
            <ToggleButton value="LIMIT">Limit</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={amountMode} exclusive onChange={(_, v) => v && setAmountMode(v)} fullWidth size="small">
            <ToggleButton value="USD">$</ToggleButton>
            <ToggleButton value="SHARES">Shares</ToggleButton>
          </ToggleButtonGroup>

          <Stack direction="row" spacing={1} alignItems="stretch">
            {amountMode === "USD" ? (
              <TextField
                label={action === "BUY" ? "Spend ($)" : "Proceeds ($)"}
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                fullWidth
                inputMode="decimal"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            ) : (
              <TextField
                label={action === "BUY" ? "Buy shares" : "Sell shares"}
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                fullWidth
                inputMode="decimal"
              />
            )}

            <Button variant="outlined" onClick={handleMax} sx={{ width: 92, flex: "0 0 auto" }}>
              Max
            </Button>

            {orderType === "LIMIT" && (
              <TextField
                label="Limit (¢)"
                value={limitCents}
                onChange={(e) => setLimitCents(e.target.value)}
                sx={{ width: 140 }}
                inputMode="numeric"
              />
            )}
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: -0.25 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Balance: ${walletCashUsd.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Available to sell: {positionSharesBefore.toFixed(2)}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gap: 0.5 }}>
            <Row label="Estimated price" value={fmtCents(execSidePrice)} />
            <Row label="Shares" value={shares.toFixed(2)} />
            <Row label="Notional" value={`$${notionalUsd.toFixed(2)}`} />
            <Row label="Fee (est.)" value={`$${feeUsd.toFixed(2)}`} />
            {action === "BUY" && totalCostUsd != null && <Row label="Total cost" value={`$${totalCostUsd.toFixed(2)}`} />}
            {action === "SELL" && netProceedsUsd != null && <Row label="Net proceeds" value={`$${netProceedsUsd.toFixed(2)}`} />}
          </Box>

          <Alert severity="info" variant="outlined">
            Market fills immediately. Limit becomes an open order (mock). Contracts pay $1 if correct, $0 otherwise.
          </Alert>

          <Button size="large" variant="contained" disabled={Boolean(disabledReason)} onClick={() => setOpenConfirm(true)}>
            {disabledReason ? disabledReason : "Review order"}
          </Button>

          {onRequestClose && (
            <Button size="large" variant="text" onClick={onRequestClose} sx={{ mt: -0.5 }}>
              Close
            </Button>
          )}
        </Box>
      </Paper>

      <ConfirmTradeDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        payload={confirmPayload}
        onConfirm={(p) => {
          const res = accountActions.placeOrder({
            marketId: p.marketId,
            yesPrice,
            action: p.action,
            side: p.side,
            orderType: p.orderType,
            execSidePrice: p.execSidePrice,
            limitSidePrice: p.limitSidePrice,
            shares: p.shares,
          });

          if (!res.ok) {
            notify({ severity: "error", message: res.error ?? "Order failed" });
            return;
          }

          notify({
            severity: "success",
            message:
              p.orderType === "MARKET"
                ? `Filled (mock): ${p.action} ${p.side} • ${p.shares.toFixed(0)} shares`
                : `Placed (mock): ${p.action} LIMIT ${p.side} • ${p.shares.toFixed(0)} shares`,
          });

          setOpenConfirm(false);
          onRequestClose?.();
        }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  );
}
