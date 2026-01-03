import { Box, Chip, Divider, Link, Paper, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { mockMarkets } from "../data/mockMarkets";
import { mockMarketDetailsById } from "../data/mockMarketDetails";
import {
  mockHistoryByMarketId,
  mockOrderBookByMarketId,
  type TimeRangeKey,
} from "../data/mockMarketExtras";

import { CategoryBadge } from "../components/CategoryBadge";
import { PriceChart } from "../components/PriceChart";
import { OrderBook } from "../components/OrderBook";
import { ResponsiveTrade } from "../components/ResponsiveTrade";
import { RecentTrades } from "../components/RecentTrades";
import { OpenOrdersPanel } from "../components/OpenOrdersPanel";
import { PositionWidget } from "../components/PositionWidget";
import { MarketChat } from "../components/MarketChat";
import { MarketChatSkeleton } from "../components/MarketChatSkeleton";

import { accountActions, useAccountStore } from "../data/accountStore";

export function MarketDetailPage() {
  const { id } = useParams();
  const market = useMemo(() => mockMarkets.find((m) => m.id === id), [id]);
  const [range, setRange] = useState<TimeRangeKey>("1D");

  const position = useAccountStore(
    (s) => s.positions.find((p) => p.marketId === id && p.status === "OPEN" && p.shares > 0) ?? null
  );
  const openOrders = useAccountStore((s) => s.openOrders.filter((o) => o.marketId === id));
  const recentTrades = useAccountStore((s) => s.trades.filter((t) => t.marketId === id).slice(0, 50));

  const chatLoading = false;

  if (!market) return <Typography sx={{ pt: 2 }}>Market not found.</Typography>;

  const seriesByRange = mockHistoryByMarketId[market.id];
  const book = mockOrderBookByMarketId[market.id];
  const details = mockMarketDetailsById[market.id];

  const tradingDisabled = market.status !== "TRADING";
  const disabledReason =
    market.status === "HALTED"
      ? "Trading is temporarily halted"
      : market.status === "RESOLVED"
        ? "This market is resolved"
        : "Trading is unavailable";

  const relatedMarkets = useMemo(() => {
    const ids = details?.relatedMarketIds ?? [];
    return ids
      .map((rid) => mockMarkets.find((m) => m.id === rid))
      .filter((m): m is (typeof mockMarkets)[number] => Boolean(m));
  }, [details?.relatedMarketIds]);

  const GAP = 1;
  const panelSx = {
    p: { xs: 1.15, sm: 1.25 },
    borderRadius: 1.75,
  } as const;

  return (
    <Box sx={{ display: "grid", gap: GAP, pt: 1.5, minWidth: 0 }}>
      {/* HEADER */}
      <Paper sx={panelSx}>
        <Stack spacing={0.6}>
          {tradingDisabled && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(255,193,7,0.12)",
                borderRadius: 1.25,
                px: 1,
                py: 0.6,
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                {disabledReason}
              </Typography>
            </Box>
          )}

          <Typography variant="h6">{market.question}</Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <CategoryBadge category={market.category} />
            <Chip size="small" label={market.status} variant="outlined" />
            <Chip size="small" label={`Vol $${market.volumeUsd.toLocaleString()}`} variant="outlined" />
          </Stack>
        </Stack>
      </Paper>

      {/* ROW 1: Price + Rules + Open Orders | Trade */}
      <Box
        sx={{
          display: "grid",
          gap: GAP,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.25fr) minmax(0, 0.85fr)" },
          alignItems: "start",
          minWidth: 0,
        }}
      >
        {/* LEFT COLUMN */}
        <Stack spacing={GAP} minWidth={0}>
          {/* Price */}
          <Paper sx={panelSx}>
            <Typography variant="subtitle1" fontWeight={700}>
              Price
            </Typography>
            <Divider sx={{ my: 0.9 }} />
            <PriceChart seriesByRange={seriesByRange} range={range} onRangeChange={setRange} />
          </Paper>

          {/* Rules */}
          <Paper sx={panelSx}>
            <Typography variant="subtitle1" fontWeight={700}>
              Rules
            </Typography>
            <Divider sx={{ my: 0.9 }} />
            <Stack spacing={0.6}>
              <Typography variant="body2" color="text.secondary">
                <b>Criteria:</b> {details?.resolution?.criteria}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Source:</b> {details?.resolution?.sourceOfTruth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Payout:</b> {details?.resolution?.payout}
              </Typography>
            </Stack>
          </Paper>

          {/* Open Orders (moved here) */}
          <OpenOrdersPanel
            dense
            orders={openOrders}
            onCancelOrder={(orderId) => accountActions.cancelOrder(orderId)}
          />
        </Stack>

        {/* RIGHT COLUMN */}
        <Stack spacing={GAP} minWidth={0}>
          {position && (
            <PositionWidget
              position={position}
              currentYesPrice={market.yesPrice}
              onExit={(side) =>
                accountActions.placeOrder({
                  marketId: market.id,
                  yesPrice: market.yesPrice,
                  action: "SELL",
                  side,
                  orderType: "MARKET",
                  execSidePrice: side === "YES" ? market.yesPrice : 1 - market.yesPrice,
                  shares: position.shares,
                })
              }
            />
          )}

          <ResponsiveTrade
            marketId={market.id}
            yesPrice={market.yesPrice}
            orderBook={book}
            isTradingDisabled={tradingDisabled}
            tradingDisabledReason={disabledReason}
          />
        </Stack>
      </Box>

      {/* ROW 2: About */}
      <Paper sx={panelSx}>
        <Typography variant="subtitle1" fontWeight={700}>
          About
        </Typography>
        <Divider sx={{ my: 0.9 }} />
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            {details?.summary}
          </Typography>

          {details?.sources?.length && (
            <>
              <Divider />
              {details.sources.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  underline="hover"
                  fontSize={13}
                  fontWeight={600}
                >
                  {s.label}
                </Link>
              ))}
            </>
          )}

          {relatedMarkets.length > 0 && (
            <>
              <Divider />
              {relatedMarkets.map((rm) => (
                <Link
                  key={rm.id}
                  component={RouterLink}
                  to={`/markets/${rm.id}`}
                  underline="hover"
                  fontSize={13}
                  fontWeight={600}
                >
                  {rm.question}
                </Link>
              ))}
            </>
          )}
        </Stack>
      </Paper>

      {/* ROW 3: Recent Trades | Order Book */}
      <Box
        sx={{
          display: "grid",
          gap: GAP,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
          minWidth: 0,
        }}
      >
        <RecentTrades trades={recentTrades} />
        <OrderBook book={book} />
      </Box>

      {/* ROW 4: Chat */}
      <Paper sx={panelSx}>
        {chatLoading ? <MarketChatSkeleton /> : <MarketChat marketId={market.id} />}
      </Paper>
    </Box>
  );
}
