// src/components/TradePanel.tsx
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNotify } from "../app/notifications";
import { accountActions, useAccountStore } from "../data/accountStore";
import type { OrderBook } from "../data/mockMarketExtras";
import { ConfirmTradeDialog, type ConfirmTradePayload } from "./ConfirmTradeDialog";

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

function fmtUsd(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function parsePositive(s: string) {
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

// Keep consistent with accountStore.ts (mock fee model)
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

  /** When true, disables the ticket (e.g. HALTED / RESOLVED). */
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
  const [amountMode, setAmountMode] = useState<AmountMode>("USD");

  const [usd, setUsd] = useState("25");
  const [sharesInput, setSharesInput] = useState("");
  const [limitCents, setLimitCents] = useState(String(Math.round((side === "YES" ? yesPrice : 1 - yesPrice) * 100)));

  const [openConfirm, setOpenConfirm] = useState(false);

  const yesMid = clamp01(yesPrice);
  const noMid = clamp01(1 - yesPrice);

  const positionSharesBefore = useMemo(() => {
    if (side === "YES") return posYes?.shares ?? 0;
    return posNo?.shares ?? 0;
  }, [side, posYes, posNo]);

  // Keep limit default aligned with selected side.
  useEffect(() => {
    setLimitCents(String(Math.round((side === "YES" ? yesPrice : 1 - yesPrice) * 100)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  // Apply preset when key changes.
  useEffect(() => {
    if (!preset || presetKey == null) return;
    if (preset.action) setAction(preset.action);
    if (preset.side) setSide(preset.side);
    if (preset.orderType) setOrderType(preset.orderType);
    if (preset.amountMode) setAmountMode(preset.amountMode);
    if (preset.autoMax) setTimeout(() => handleMax(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  // Best execution price proxy based on YES-side order book.
  const bestAskYes = orderBook?.asks?.[0]?.price;
  const bestBidYes = orderBook?.bids?.[0]?.price;

  const marketSidePrice = useMemo(() => {
    // Convert YES book to side price for YES/NO.
    if (action === "BUY") {
      if (side === "YES") return bestAskYes ?? yesPrice;
      return clamp01(1 - (bestBidYes ?? yesPrice));
    }
    // SELL
    if (side === "YES") return bestBidYes ?? yesPrice;
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

  const payoutUsd = useMemo(() => shares * 1, [shares]);
  const maxProfitUsd = useMemo(() => {
    if (action !== "BUY") return undefined;
    return payoutUsd - (totalCostUsd ?? 0);
  }, [action, payoutUsd, totalCostUsd]);

  const positionSharesAfter = useMemo(() => {
    if (action === "SELL") return Math.max(0, positionSharesBefore - shares);
    return positionSharesBefore + shares;
  }, [action, positionSharesBefore, shares]);

  const disabledReason = useMemo(() => {
    if (isTradingDisabled) return tradingDisabledReason || "Trading disabled";
    if (!Number.isFinite(shares) || shares <= 0) return "Enter amount";

    if (orderType === "LIMIT") {
      if (!Number.isFinite(limitSidePrice) || limitSidePrice <= 0 || limitSidePrice >= 1) return "Bad limit";
    }

    if (action === "BUY") {
      if (totalCostUsd != null && totalCostUsd > walletCashUsd + 1e-9) return "Insufficient cash";
    } else {
      if (positionSharesBefore <= 0) return `No ${side} shares`;
      if (shares > positionSharesBefore + 1e-9) return "Too many shares";
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

  function setQuickUsd(v: number) {
    setAmountMode("USD");
    setUsd(String(v));
  }
  function setQuickShares(v: number) {
    setAmountMode("SHARES");
    setSharesInput(String(v));
  }

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

  const title = `${action === "BUY" ? "Buy" : "Sell"} ${side}`;
  const ctaLabel =
    disabledReason ||
    (action === "BUY" ? `Review ${side} buy` : `Review ${side} sell`);

  const yesBg = alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.16 : 0.10);
  const noBg = alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.16 : 0.10);

  const selectedYes = side === "YES";
  const selectedNo = side === "NO";

  const ctaColor: "success" | "error" | "primary" =
    action === "BUY" ? (side === "YES" ? "success" : "error") : "primary";

  return (
    <>
      <Paper
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={1.1}>
          {/* Header (Kalshi-ish: clean, minimal) */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                Trade
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {orderType === "MARKET" ? "Market" : "Limit"} • Est. {fmtCents(execSidePrice)}
              </Typography>
            </Box>
            <Chip size="small" label={`Cash ${fmtUsd(walletCashUsd)}`} variant="outlined" />
          </Box>

          {/* Buy/Sell + Market/Limit (segmented, compact) */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <ToggleButtonGroup
              value={action}
              exclusive
              onChange={(_, v) => v && setAction(v)}
              size="small"
              sx={{
                flex: 1,
                borderRadius: 999,
                "& .MuiToggleButton-root": { flex: 1, fontWeight: 900, py: 0.7 },
              }}
            >
              <ToggleButton value="BUY">Buy</ToggleButton>
              <ToggleButton value="SELL">Sell</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={orderType}
              exclusive
              onChange={(_, v) => v && setOrderType(v)}
              size="small"
              sx={{
                flex: 1,
                borderRadius: 999,
                "& .MuiToggleButton-root": { flex: 1, fontWeight: 850, py: 0.7 },
              }}
            >
              <ToggleButton value="MARKET">Market</ToggleButton>
              <ToggleButton value="LIMIT">Limit</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Outcome selector (Kalshi-like: two big price buttons) */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Box
              onClick={() => setSide("YES")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSide("YES")}
              sx={{
                p: 1.1,
                cursor: isTradingDisabled ? "not-allowed" : "pointer",
                bgcolor: selectedYes ? yesBg : "transparent",
                borderRight: "1px solid",
                borderColor: "divider",
                outline: "none",
                "&:hover": { bgcolor: selectedYes ? yesBg : alpha(theme.palette.success.main, 0.06) },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 950 }}>
                  YES
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 950 }}>
                  {fmtCents(yesMid)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {Math.round(yesMid * 100)}% chance
              </Typography>
              {selectedYes ? (
                <Typography variant="caption" sx={{ display: "block", mt: 0.25, fontWeight: 850, color: "text.primary" }}>
                  Selected
                </Typography>
              ) : null}
            </Box>

            <Box
              onClick={() => setSide("NO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSide("NO")}
              sx={{
                p: 1.1,
                cursor: isTradingDisabled ? "not-allowed" : "pointer",
                bgcolor: selectedNo ? noBg : "transparent",
                outline: "none",
                "&:hover": { bgcolor: selectedNo ? noBg : alpha(theme.palette.error.main, 0.06) },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 950 }}>
                  NO
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 950 }}>
                  {fmtCents(noMid)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {Math.round(noMid * 100)}% chance
              </Typography>
              {selectedNo ? (
                <Typography variant="caption" sx={{ display: "block", mt: 0.25, fontWeight: 850, color: "text.primary" }}>
                  Selected
                </Typography>
              ) : null}
            </Box>
          </Box>

          {/* Amount block (Kalshi-ish: one clean row + quick picks) */}
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.1 }}>
            <Stack spacing={0.85}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <ToggleButtonGroup
                  value={amountMode}
                  exclusive
                  onChange={(_, v) => v && setAmountMode(v)}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    "& .MuiToggleButton-root": { px: 1.15, fontWeight: 850, py: 0.55 },
                  }}
                >
                  <ToggleButton value="USD">$</ToggleButton>
                  <ToggleButton value="SHARES">Shares</ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
                  You have <b>{positionSharesBefore.toFixed(0)}</b> sh
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="stretch">
                {amountMode === "USD" ? (
                  <TextField
                    label={action === "BUY" ? "Spend" : "Notional"}
                    value={usd}
                    onChange={(e) => setUsd(e.target.value)}
                    fullWidth
                    size="small"
                    inputMode="decimal"
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                ) : (
                  <TextField
                    label="Shares"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    fullWidth
                    size="small"
                    inputMode="decimal"
                  />
                )}

                {orderType === "LIMIT" ? (
                  <TextField
                    label="Limit ¢"
                    value={limitCents}
                    onChange={(e) => setLimitCents(e.target.value)}
                    size="small"
                    sx={{ width: 118, flex: "0 0 auto" }}
                    inputMode="numeric"
                  />
                ) : (
                  <Box
                    sx={{
                      width: 118,
                      flex: "0 0 auto",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.03),
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Est. <b>{fmtCents(execSidePrice)}</b>
                    </Typography>
                  </Box>
                )}

                <Button variant="outlined" onClick={handleMax} size="small" sx={{ width: 74, flex: "0 0 auto" }}>
                  Max
                </Button>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                {amountMode === "USD" ? (
                  <>
                    <Button size="small" variant="text" onClick={() => setQuickUsd(10)} sx={{ minWidth: 0, px: 0.75 }}>
                      $10
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickUsd(25)} sx={{ minWidth: 0, px: 0.75 }}>
                      $25
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickUsd(50)} sx={{ minWidth: 0, px: 0.75 }}>
                      $50
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickUsd(100)} sx={{ minWidth: 0, px: 0.75 }}>
                      $100
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="small" variant="text" onClick={() => setQuickShares(10)} sx={{ minWidth: 0, px: 0.75 }}>
                      10
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickShares(50)} sx={{ minWidth: 0, px: 0.75 }}>
                      50
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickShares(100)} sx={{ minWidth: 0, px: 0.75 }}>
                      100
                    </Button>
                    <Button size="small" variant="text" onClick={() => setQuickShares(250)} sx={{ minWidth: 0, px: 0.75 }}>
                      250
                    </Button>
                  </>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Shares <b>{shares > 0 ? shares.toFixed(2) : "—"}</b>
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Summary (fixed: cleaner, with a primary “You pay/receive” row) */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 1.1,
              bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.03),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                Summary
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {title}
              </Typography>
            </Box>

            <Divider sx={{ my: 0.85 }} />

            {/* Primary row */}
            {action === "BUY" ? (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "baseline" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  You pay (est.)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.05 }}>
                  {totalCostUsd != null && totalCostUsd > 0 ? fmtUsd(totalCostUsd) : "—"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "baseline" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  You receive (est.)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.05 }}>
                  {netProceedsUsd != null && netProceedsUsd > 0 ? fmtUsd(netProceedsUsd) : "—"}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "grid", gap: 0.5, mt: 0.85 }}>
              <SummaryLine label="Avg price" value={shares > 0 ? fmtCents(execSidePrice) : "—"} />
              <SummaryLine label="Notional" value={notionalUsd > 0 ? fmtUsd(notionalUsd) : "—"} />
              <SummaryLine label="Fee" value={feeUsd > 0 ? fmtUsd(feeUsd) : "—"} />

              {action === "BUY" ? (
                <>
                  <SummaryLine label="Payout if correct" value={shares > 0 ? fmtUsd(payoutUsd) : "—"} />
                  <SummaryLine
                    label="Max profit"
                    value={shares > 0 ? fmtUsd(maxProfitUsd ?? 0) : "—"}
                    strong
                  />
                  <SummaryLine label="Max loss" value={totalCostUsd != null && totalCostUsd > 0 ? fmtUsd(totalCostUsd) : "—"} />
                </>
              ) : (
                <>
                  <SummaryLine label="Shares after" value={shares > 0 ? `${positionSharesAfter.toFixed(2)} sh` : `${positionSharesBefore.toFixed(2)} sh`} />
                </>
              )}
            </Box>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.85 }}>
              Fees are estimated (mock). Trading risks capital.
            </Typography>
          </Box>

          {isTradingDisabled ? (
            <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
              {tradingDisabledReason || "Trading is currently disabled for this market."}
            </Alert>
          ) : (
            <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
              Orders are simulated. Limit orders appear in Open orders.
            </Alert>
          )}

          <Button
            size="large"
            variant="contained"
            color={ctaColor}
            disabled={Boolean(disabledReason)}
            onClick={() => setOpenConfirm(true)}
            sx={{ fontWeight: 950, py: 1.05 }}
          >
            {ctaLabel}
          </Button>

          {onRequestClose ? (
            <Button size="small" variant="text" onClick={onRequestClose} sx={{ mt: -0.25 }}>
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

function SummaryLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 950 : 850 }}>
        {value}
      </Typography>
    </Box>
  );
}
