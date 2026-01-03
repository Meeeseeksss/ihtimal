import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNotify } from "../app/notifications";
import { accountActions, useAccountStore } from "../data/accountStore";
import type { OrderBook } from "../data/mockMarketExtras";
import { ConfirmTradeDialog, type ConfirmTradePayload } from "./ConfirmTradeDialog";

type OrderType = "MARKET" | "LIMIT";
type Side = "YES" | "NO";
type Action = "BUY" | "SELL";

export type TradePreset = {
  action?: Action;
  side?: Side;
  orderType?: OrderType;
  autoMax?: boolean;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function fmtCents(p: number) {
  return `${Math.round(p * 100)}¢`;
}

function fmtUsd(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function parseNonNeg(s: string) {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

// Mock fee model (keep consistent with accountStore.ts)
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
  const fee = estimateFee(notional);
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
  const theme = useTheme();
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

  // Polymarket-style amount: big display + quick bumps
  const [usd, setUsd] = useState("0");
  const [limitCents, setLimitCents] = useState(String(Math.round(yesPrice * 100)));

  const [openConfirm, setOpenConfirm] = useState(false);

  // Order type dropdown
  const [orderMenuAnchor, setOrderMenuAnchor] = useState<HTMLElement | null>(null);
  const orderMenuOpen = Boolean(orderMenuAnchor);

  const yesMid = clamp01(yesPrice);
  const noMid = clamp01(1 - yesPrice);

  const positionSharesBefore = useMemo(() => {
    return side === "YES" ? posYes?.shares ?? 0 : posNo?.shares ?? 0;
  }, [posYes, posNo, side]);

  // Best execution price proxy based on YES-side order book
  const bestAskYes = orderBook?.asks?.[0]?.price;
  const bestBidYes = orderBook?.bids?.[0]?.price;

  const marketSidePrice = useMemo(() => {
    if (action === "BUY") {
      if (side === "YES") return bestAskYes ?? yesPrice;
      return clamp01(1 - (bestBidYes ?? yesPrice));
    }
    // SELL
    if (side === "YES") return bestBidYes ?? yesPrice;
    return clamp01(1 - (bestAskYes ?? yesPrice));
  }, [action, side, bestAskYes, bestBidYes, yesPrice]);

  // Keep limit default aligned with selected side
  useEffect(() => {
    const p = side === "YES" ? yesPrice : 1 - yesPrice;
    setLimitCents(String(Math.round(p * 100)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  // Apply preset when key changes
  useEffect(() => {
    if (!preset || presetKey == null) return;
    if (preset.action) setAction(preset.action);
    if (preset.side) setSide(preset.side);
    if (preset.orderType) setOrderType(preset.orderType);
    if (preset.autoMax) setTimeout(() => handleMax(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  const limitSidePrice = useMemo(() => clamp01(Number(limitCents || 0) / 100), [limitCents]);
  const execSidePrice = orderType === "MARKET" ? clamp01(marketSidePrice) : limitSidePrice;

  const inputUsd = parseNonNeg(usd);
  const shares = useMemo(() => {
    if (execSidePrice <= 0) return 0;
    return inputUsd / execSidePrice;
  }, [inputUsd, execSidePrice]);

  const notionalUsd = useMemo(() => shares * execSidePrice, [shares, execSidePrice]);
  const feeUsd = useMemo(() => estimateFee(notionalUsd), [notionalUsd]);

  const totalCostUsd = useMemo(() => (action === "BUY" ? notionalUsd + feeUsd : undefined), [action, notionalUsd, feeUsd]);
  const netProceedsUsd = useMemo(
    () => (action === "SELL" ? Math.max(0, notionalUsd - feeUsd) : undefined),
    [action, notionalUsd, feeUsd]
  );

  const payoutUsd = useMemo(() => shares * 1, [shares]);
  const maxProfitUsd = useMemo(() => {
    if (action !== "BUY") return 0;
    return payoutUsd - (totalCostUsd ?? 0);
  }, [action, payoutUsd, totalCostUsd]);

  const disabledReason = useMemo(() => {
    if (isTradingDisabled) return tradingDisabledReason || "Trading disabled";
    if (!Number.isFinite(shares) || shares <= 0) return "Enter amount";

    if (orderType === "LIMIT") {
      if (!Number.isFinite(limitSidePrice) || limitSidePrice <= 0 || limitSidePrice >= 1) return "Bad limit";
    }

    if (action === "BUY") {
      if ((totalCostUsd ?? 0) > walletCashUsd + 1e-9) return "Insufficient cash";
    } else {
      if (positionSharesBefore <= 0) return `No ${side} shares`;
      if (shares > positionSharesBefore + 1e-9) return "Too many shares";
    }

    return null;
  }, [
    action,
    isTradingDisabled,
    limitSidePrice,
    orderType,
    positionSharesBefore,
    shares,
    side,
    totalCostUsd,
    tradingDisabledReason,
    walletCashUsd,
  ]);

  function bumpUsd(delta: number) {
    const next = Math.max(0, parseNonNeg(usd) + delta);
    setUsd(String(Math.round(next)));
  }

  function handleMax() {
    if (action === "BUY") {
      const maxNotional = maxNotionalForBalance(walletCashUsd);
      setUsd(String(Math.floor(maxNotional)));
      return;
    }
    // SELL: set amount to full notional at current price
    const maxNotional = positionSharesBefore * execSidePrice;
    setUsd(String(Math.floor(maxNotional)));
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

  // --- Match app theme (Apple-like light) ---
  const divider = theme.palette.divider;
  const surface = theme.palette.background.paper;
  const soft = alpha(theme.palette.text.primary, 0.04);
  const soft2 = alpha(theme.palette.text.primary, 0.06);

  const yesLabelPrice = action === "BUY" ? (bestAskYes ?? yesMid) : (bestBidYes ?? yesMid);
  const noLabelPrice = clamp01(1 - yesLabelPrice);

  const yesSelected = side === "YES";
  const noSelected = side === "NO";

  const yesFill = alpha(theme.palette.success.main, 0.16);
  const yesFillHover = alpha(theme.palette.success.main, 0.22);
  const yesStroke = alpha(theme.palette.success.main, 0.38);

  const noFill = alpha("#000", 0.035);
  const noFillHover = alpha("#000", 0.06);

  const ctaDisabled = Boolean(disabledReason);

  const payOrReceiveLabel = action === "BUY" ? "You pay (est.)" : "You receive (est.)";
  const payOrReceiveValue =
    shares > 0
      ? action === "BUY"
        ? fmtUsd(totalCostUsd ?? 0)
        : fmtUsd(netProceedsUsd ?? 0)
      : "—";

  const summaryRows = useMemo(() => {
    const rows = [
      { k: "Avg price", v: shares > 0 ? fmtCents(execSidePrice) : "—" },
      { k: "Shares", v: shares > 0 ? shares.toFixed(2) : "—" },
      { k: "Fee", v: feeUsd > 0 ? fmtUsd(feeUsd) : "—" },
    ];
    if (action === "BUY") {
      rows.push({ k: "Payout", v: shares > 0 ? fmtUsd(payoutUsd) : "—" });
      rows.push({ k: "Max profit", v: shares > 0 ? fmtUsd(maxProfitUsd) : "—" });
    } else {
      rows.push({ k: "Notional", v: shares > 0 ? fmtUsd(notionalUsd) : "—" });
    }
    return rows;
  }, [action, execSidePrice, feeUsd, maxProfitUsd, notionalUsd, payoutUsd, shares]);

  return (
    <>
      <Paper sx={{ p: 1.75, borderRadius: 2, bgcolor: surface }}>
        <Stack spacing={1.35}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>
              Trade
            </Typography>
            <Chip size="small" variant="outlined" label={`Cash ${fmtUsd(walletCashUsd)}`} />
          </Box>

          {/* Buy / Sell tabs + Market dropdown */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 2.25 }}>
              <UnderlineTab active={action === "BUY"} onClick={() => setAction("BUY")}>
                Buy
              </UnderlineTab>
              <UnderlineTab active={action === "SELL"} onClick={() => setAction("SELL")}>
                Sell
              </UnderlineTab>
            </Box>

            <Button
              size="small"
              variant="text"
              onClick={(e) => setOrderMenuAnchor(e.currentTarget)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 1.1,
                py: 0.55,
                borderRadius: 1.5,
                bgcolor: soft2,
                border: `1px solid ${divider}`,
                "&:hover": { bgcolor: soft2 },
              }}
            >
              {orderType === "MARKET" ? "Market" : "Limit"} ▾
            </Button>

            <Menu
              anchorEl={orderMenuAnchor}
              open={orderMenuOpen}
              onClose={() => setOrderMenuAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  setOrderType("MARKET");
                  setOrderMenuAnchor(null);
                }}
              >
                Market
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOrderType("LIMIT");
                  setOrderMenuAnchor(null);
                }}
              >
                Limit
              </MenuItem>
            </Menu>
          </Box>

          {/* YES / NO pills */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              fullWidth
              disableElevation
              disabled={Boolean(isTradingDisabled)}
              onClick={() => setSide("YES")}
              sx={{
                textTransform: "none",
                fontWeight: 650,
                borderRadius: 2,
                py: 1.05,
                border: `1px solid ${yesSelected ? yesStroke : divider}`,
                bgcolor: yesSelected ? yesFill : soft,
                "&:hover": { bgcolor: yesSelected ? yesFillHover : soft2 },
              }}
            >
              Yes {fmtCents(clamp01(yesLabelPrice))}
            </Button>

            <Button
              fullWidth
              disableElevation
              disabled={Boolean(isTradingDisabled)}
              onClick={() => setSide("NO")}
              sx={{
                textTransform: "none",
                fontWeight: 650,
                borderRadius: 2,
                py: 1.05,
                border: `1px solid ${divider}`,
                bgcolor: noSelected ? noFillHover : noFill,
                "&:hover": { bgcolor: noFillHover },
              }}
            >
              No {fmtCents(clamp01(noLabelPrice))}
            </Button>
          </Box>

          {/* Amount block */}
          <Box sx={{ border: `1px solid ${divider}`, borderRadius: 2, p: 1.25, bgcolor: soft }}>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.25, lineHeight: 1 }}>
                ${Math.round(parseNonNeg(usd))}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
              <MiniPill onClick={() => bumpUsd(1)}>+$1</MiniPill>
              <MiniPill onClick={() => bumpUsd(20)}>+$20</MiniPill>
              <MiniPill onClick={() => bumpUsd(100)}>+$100</MiniPill>
              <MiniPill onClick={handleMax}>Max</MiniPill>
            </Box>

            <Box sx={{ mt: 1 }}>
              <TextField
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                size="small"
                fullWidth
                placeholder="0"
                inputMode="numeric"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Box>

            {orderType === "LIMIT" ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  value={limitCents}
                  onChange={(e) => setLimitCents(e.target.value)}
                  size="small"
                  fullWidth
                  inputMode="numeric"
                  label="Limit price (¢)"
                />
              </Box>
            ) : null}
          </Box>
<br />
          {/* Summary */}
          <Box sx={{ border: `1px solid ${divider}`, borderRadius: 2, p: 1.2, bgcolor: surface }}>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 650 }}>
                Summary
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {action === "BUY" ? "Buying" : "Selling"} {yesSelected ? "Yes" : "No"}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {payOrReceiveLabel}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.2, lineHeight: 1 }}>
                {payOrReceiveValue}
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gap: 0.55, mt: 1 }}>
              {summaryRows.map((r) => (
                <SummaryRow key={r.k} label={r.k} value={r.v} />
              ))}
            </Box>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              Trading risks capital. Fees are estimated (mock).
            </Typography>
            {/* <br /> */}
          </Box>

          {isTradingDisabled ? (
            <Alert severity="warning" variant="outlined" sx={{ py: 0.6 }}>
              {tradingDisabledReason || "Trading is currently disabled for this market."}
            </Alert>
          ) : null}
<br />
          <Button
            size="large"
            variant="contained"
            disableElevation
            disabled={ctaDisabled}
            onClick={() => setOpenConfirm(true)}
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontWeight: 650,
              textTransform: "none",
            }}
          >
            {disabledReason ? disabledReason : "Trade"}
          </Button>

          {onRequestClose ? (
            <Button size="small" variant="text" onClick={onRequestClose} sx={{ mt: -0.25, textTransform: "none" }}>
              Close
            </Button>
          ) : null}
        </Stack>
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

function UnderlineTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      sx={{
        cursor: "pointer",
        pb: 0.75,
        borderBottom: "2px solid",
        borderBottomColor: active ? theme.palette.text.primary : "transparent",
        outline: "none",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: active ? 650 : 600,
          color: active ? "text.primary" : "text.secondary",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "baseline" }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MiniPill({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const theme = useTheme();
  return (
    <Button
      size="small"
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        textTransform: "none",
        fontWeight: 600,
        minWidth: 0,
        px: 1.05,
        py: 0.45,
        borderColor: theme.palette.divider,
        backgroundColor: alpha(theme.palette.text.primary, 0.02),
        "&:hover": {
          borderColor: theme.palette.divider,
          backgroundColor: alpha(theme.palette.text.primary, 0.035),
        },
      }}
    >
      {children}
    </Button>
  );
}
