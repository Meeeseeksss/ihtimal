// src/pages/MarketDetailPage.tsx
import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import { mockMarkets } from "../data/mockMarkets";
import { PriceChart } from "../components/PriceChart";
import { OrderBook } from "../components/OrderBook";
import { ResponsiveTrade } from "../components/ResponsiveTrade";
import {
  mockHistoryByMarketId,
  mockOrderBookByMarketId,
  type TimeRangeKey,
} from "../data/mockMarketExtras";
import { CategoryBadge } from "../components/CategoryBadge";
import { RecentTradesEmbedded } from "../components/RecentTrades";
import { OpenOrdersPanel } from "../components/OpenOrdersPanel";
import { PositionWidget } from "../components/PositionWidget";
import { accountActions, useAccountStore } from "../data/accountStore";
import { mockMarketDetailsById } from "../data/mockMarketDetails";

export function MarketDetailPage() {
  const { id } = useParams();
  const market = useMemo(() => mockMarkets.find((m) => m.id === id), [id]);
  const [range, setRange] = useState<TimeRangeKey>("1D");

  // Compact by default; expand on demand.
  const [orderBookOpen, setOrderBookOpen] = useState(false);
  const [recentTradesOpen, setRecentTradesOpen] = useState(false);

  const [presetKey, setPresetKey] = useState(0);
  const [preset, setPreset] = useState<
    | {
        action?: "BUY" | "SELL";
        side?: "YES" | "NO";
        orderType?: "MARKET" | "LIMIT";
        amountMode?: "USD" | "SHARES";
        autoMax?: boolean;
      }
    | undefined
  >(undefined);

  const position = useAccountStore(
    (s) => s.positions.find((p) => p.marketId === id && p.status === "OPEN" && p.shares > 0) ?? null
  );
  const openOrders = useAccountStore((s) => s.openOrders.filter((o) => o.marketId === id));
  const recentTrades = useAccountStore((s) => s.trades.filter((t) => t.marketId === id).slice(0, 50));

  if (!market) return <Typography sx={{ pt: 2 }}>Market not found.</Typography>;

  const seriesByRange = mockHistoryByMarketId[market.id];
  const book = mockOrderBookByMarketId[market.id];
  const details = mockMarketDetailsById[market.id];

  const bestAsk = book?.asks[0]?.price ?? 0;
  const bestBid = book?.bids[0]?.price ?? 0;
  const spread = Math.max(0, bestAsk - bestBid);

  const tradingDisabled = market.status !== "TRADING";
  const disabledReason =
    market.status === "HALTED"
      ? "Trading is temporarily halted"
      : market.status === "RESOLVED"
        ? "This market is resolved"
        : "Trading is unavailable";

  const relatedMarkets = useMemo(() => {
    const ids = details?.relatedMarketIds ?? [];
    if (ids.length === 0) return [];
    return ids
      .map((rid) => mockMarkets.find((m) => m.id === rid))
      .filter((m): m is (typeof mockMarkets)[number] => Boolean(m));
  }, [details?.relatedMarketIds]);

  return (
    <Box sx={{ display: "grid", gap: 1.75, pt: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          {tradingDisabled ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor:
                  market.status === "HALTED"
                    ? "rgba(255,193,7,0.14)"
                    : "rgba(156,39,176,0.12)",
                borderRadius: 1.5,
                px: 1.25,
                py: 0.9,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 900 }}>
                {disabledReason}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Orders are disabled in this UI when a market isn’t actively trading.
              </Typography>
            </Box>
          ) : null}

          <Typography variant="h5">{market.question}</Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <CategoryBadge category={market.category} />
            <Chip size="small" label={market.jurisdiction} variant="outlined" />
            <Chip size="small" label={market.status} variant="outlined" />
            <Chip
              size="small"
              label={`Closes ${new Date(market.resolvesAt).toLocaleString()}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Vol $${market.volumeUsd.toLocaleString()}`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Main grid */}
      <Box
        sx={{
          display: "grid",
          gap: 1.75,
          gridTemplateColumns: { xs: "1fr", xl: "1.05fr 1.25fr 0.85fr" },
          alignItems: "start",
        }}
      >
        {/* Left: about + rules + order book + trades */}
        <Stack spacing={1.75}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={0.75}>
              <Typography variant="h6">About</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {details?.summary ?? "Not found in provided files."}
              </Typography>
            </Stack>

            {details?.sources?.length ? (
              <>
                <Divider sx={{ my: 1.25 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Sources
                </Typography>
                <Box sx={{ display: "grid", gap: 0.75, mt: 0.75 }}>
                  {details.sources.map((s) => (
                    <Link
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      underline="hover"
                      sx={{ fontSize: 13, fontWeight: 700 }}
                    >
                      {s.label}
                    </Link>
                  ))}
                </Box>
              </>
            ) : null}

            {relatedMarkets.length ? (
              <>
                <Divider sx={{ my: 1.25 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Related markets
                </Typography>
                <Box sx={{ display: "grid", gap: 0.75, mt: 0.75 }}>
                  {relatedMarkets.map((rm) => (
                    <Link
                      key={rm.id}
                      component={RouterLink}
                      to={`/markets/${rm.id}`}
                      underline="hover"
                      sx={{ fontSize: 13, fontWeight: 700 }}
                    >
                      {rm.question}
                    </Link>
                  ))}
                </Box>
              </>
            ) : null}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Rules</Typography>
            <Divider sx={{ my: 1.25 }} />

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <b>Resolution criteria:</b> {details?.resolution?.criteria ?? "Not found in provided files."}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              <b>Source of truth:</b> {details?.resolution?.sourceOfTruth ?? "Not found in provided files."}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              <b>Payout:</b> {details?.resolution?.payout ?? "Winning shares pay $1. Losing shares pay $0."}
            </Typography>

            {details?.resolution?.edgeCases?.length ? (
              <>
                <Divider sx={{ my: 1.25 }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Edge cases
                </Typography>
                <Box sx={{ display: "grid", gap: 0.75, mt: 0.75 }}>
                  {details.resolution.edgeCases.map((e, i) => (
                    <Typography key={i} variant="body2" sx={{ color: "text.secondary" }}>
                      • {e}
                    </Typography>
                  ))}
                </Box>
              </>
            ) : null}
          </Paper>

          {/* Order book (collapsed by default) */}
          {book ? (
            <Paper sx={{ p: 2 }}>
              <ButtonBase
                onClick={() => setOrderBookOpen((v) => !v)}
                sx={{
                  width: "100%",
                  borderRadius: 1.5,
                  textAlign: "left",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "grid", gap: 0.25, minWidth: 0 }}>
                    <Typography variant="h6">Order book</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Spread <b>{Math.round(spread * 100)}¢</b> • Best bid <b>{Math.round(bestBid * 100)}¢</b> • Best ask{" "}
                      <b>{Math.round(bestAsk * 100)}¢</b>
                    </Typography>
                  </Box>

                  <ExpandMoreRoundedIcon
                    sx={{
                      mt: 0.35,
                      transition: "transform 160ms ease",
                      transform: orderBookOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: "text.secondary",
                      flex: "0 0 auto",
                    }}
                  />
                </Box>
              </ButtonBase>

              <Collapse in={orderBookOpen} timeout="auto" unmountOnExit>
                <OrderBook book={book} embedded />
              </Collapse>
            </Paper>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Order book</Typography>
              <Divider sx={{ my: 1.25 }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No order book available.
              </Typography>
            </Paper>
          )}

          {/* Recent trades (collapsed by default) */}
          <Paper sx={{ p: 2 }}>
            <ButtonBase
              onClick={() => setRecentTradesOpen((v) => !v)}
              sx={{
                width: "100%",
                borderRadius: 1.5,
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "grid", gap: 0.25, minWidth: 0 }}>
                  <Typography variant="h6">Recent trades</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {recentTrades.length === 0
                      ? "No recent trades"
                      : `${recentTrades.length} trades • Latest ${Math.round(recentTrades[0].price * 100)}¢ (${new Date(
                          recentTrades[0].ts
                        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`}
                  </Typography>
                </Box>

                <ExpandMoreRoundedIcon
                  sx={{
                    mt: 0.35,
                    transition: "transform 160ms ease",
                    transform: recentTradesOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "text.secondary",
                    flex: "0 0 auto",
                  }}
                />
              </Box>
            </ButtonBase>

            <Collapse in={recentTradesOpen} timeout="auto" unmountOnExit>
              <RecentTradesEmbedded trades={recentTrades} />
            </Collapse>
          </Paper>
        </Stack>

        {/* Center: chart */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Price</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            YES probability over time
          </Typography>
          <Divider sx={{ my: 1.25 }} />
          {seriesByRange ? (
            <PriceChart seriesByRange={seriesByRange} range={range} onRangeChange={setRange} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No history available.
            </Typography>
          )}
        </Paper>

        {/* Right: position + trade + open orders */}
        <Stack spacing={1.75} sx={{ position: { xl: "sticky" }, top: { xl: 80 } }}>
          {position ? (
            <PositionWidget
              position={position}
              currentYesPrice={market.yesPrice}
              onExit={(side) => {
                setPreset({ action: "SELL", side, orderType: "MARKET", amountMode: "SHARES", autoMax: true });
                setPresetKey((k) => k + 1);
              }}
            />
          ) : null}

          <ResponsiveTrade
            marketId={market.id}
            yesPrice={market.yesPrice}
            orderBook={book}
            isTradingDisabled={tradingDisabled}
            tradingDisabledReason={disabledReason}
            presetKey={presetKey}
            preset={preset}
          />

          <OpenOrdersPanel
            orders={openOrders}
            onCancelOrder={(orderId) => accountActions.cancelOrder(orderId)}
          />
        </Stack>
      </Box>
    </Box>
  );
}
