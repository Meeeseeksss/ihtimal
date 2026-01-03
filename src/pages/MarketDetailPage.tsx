import {
  Box,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
import { PositionWidget } from "../components/PositionWidget";
import { MarketChat } from "../components/MarketChat";
import { MarketChatSkeleton } from "../components/MarketChatSkeleton";

import { accountActions, useAccountStore } from "../data/accountStore";
import { mockMarkets as allMarkets } from "../data/mockMarkets";

export function MarketDetailPage() {
  const { id } = useParams();
  const market = useMemo(() => mockMarkets.find((m) => m.id === id), [id]);
  const [range, setRange] = useState<TimeRangeKey>("1D");

  useEffect(() => {
    const prev = document.title;
    if (market?.question) document.title = `${market.question} • Ihtimal`;
    return () => {
      document.title = prev;
    };
  }, [market?.question]);

  const position = useAccountStore(
    (s) =>
      s.positions.find(
        (p) => p.marketId === id && p.status === "OPEN" && p.shares > 0
      ) ?? null
  );

  const recentTrades = useAccountStore((s) =>
    s.trades.filter((t) => t.marketId === id).slice(0, 50)
  );

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

  const resolvesAt = useMemo(() => new Date(market.resolvesAt), [market.resolvesAt]);

  const resolvesLabel = useMemo(() => {
    try {
      const date = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(resolvesAt);
      const time = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(resolvesAt);
      return `${date} • ${time}`;
    } catch {
      return market.resolvesAt;
    }
  }, [market.resolvesAt, resolvesAt]);

  const timeToClose = useMemo(() => {
    const now = Date.now();
    const diff = resolvesAt.getTime() - now;
    if (!Number.isFinite(diff)) return null;
    if (diff <= 0) return "Closed";

    const totalMin = Math.floor(diff / 60000);
    const days = Math.floor(totalMin / (60 * 24));
    const hours = Math.floor((totalMin % (60 * 24)) / 60);
    const mins = totalMin % 60;

    if (days >= 2) return `${days}d left`;
    if (days === 1) return `1d ${hours}h left`;
    if (hours >= 1) return `${hours}h ${mins}m left`;
    return `${Math.max(1, mins)}m left`;
  }, [resolvesAt]);

  const relatedMarkets = useMemo(() => {
    const ids = details?.relatedMarketIds ?? [];
    return ids
      .map((rid) => allMarkets.find((m) => m.id === rid))
      .filter((m): m is (typeof allMarkets)[number] => Boolean(m));
  }, [details?.relatedMarketIds]);

  const GAP = 1;
  const panelSx = {
    p: { xs: 1.15, sm: 1.25 },
    borderRadius: 1.75,
  } as const;

  const infoCardSx = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    p: 1.15,
    minWidth: 0,
  } as const;

  return (
    <Box sx={{ display: "grid", gap: GAP, pt: 1.5, minWidth: 0 }}>
      {/* HEADER */}
      <Paper sx={panelSx}>
        <Stack spacing={0.7}>
          {tradingDisabled && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(255,193,7,0.12)",
                borderRadius: 1.5,
                px: 1,
                py: 0.65,
              }}
            >
              <Typography variant="body2" fontWeight={800}>
                {disabledReason}
              </Typography>
            </Box>
          )}

          <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
            {market.question}
          </Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
            <CategoryBadge category={market.category} />
            <Chip size="small" label={market.jurisdiction} variant="outlined" />
            <Chip size="small" label={market.status} variant="outlined" />
            <Chip size="small" label={`Resolves ${resolvesLabel}`} variant="outlined" />
            {timeToClose ? <Chip size="small" label={timeToClose} variant="outlined" /> : null}
            <Chip
              size="small"
              label={`Vol $${market.volumeUsd.toLocaleString()}`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* TOP ROW: LEFT (Price + Market Info) | RIGHT (Trade) */}
      <Box
        sx={{
          display: "grid",
          gap: GAP,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.25fr) minmax(0, 0.85fr)",
          },
          alignItems: "start",
          minWidth: 0,
        }}
      >
        {/* LEFT COLUMN */}
        <Stack spacing={GAP} minWidth={0}>
          {/* Price */}
          <Paper sx={panelSx}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={800}>
                Price
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Implied probability
              </Typography>
            </Stack>
            <Divider sx={{ my: 0.9 }} />
            <PriceChart
              seriesByRange={seriesByRange}
              range={range}
              onRangeChange={setRange}
            />
          </Paper>

          {/* Market info (back) */}
          <Paper sx={panelSx}>
            <Typography variant="subtitle1" fontWeight={800}>
              Market info
            </Typography>
            <Divider sx={{ my: 0.9 }} />

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <Box sx={infoCardSx}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Contract
                </Typography>
                <Typography variant="body2" fontWeight={900} sx={{ mt: 0.25 }}>
                  YES / NO
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                  Winning shares pay <b>$1.00</b>.
                </Typography>
              </Box>

              <Box sx={infoCardSx}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Timeline
                </Typography>
                <Typography variant="body2" fontWeight={900} sx={{ mt: 0.25 }}>
                  Resolves {resolvesLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                  {timeToClose ?? ""}
                </Typography>
              </Box>

              <Box sx={infoCardSx}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Settlement criteria
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {details?.resolution?.criteria ?? "—"}
                </Typography>
              </Box>

              <Box sx={infoCardSx}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Source of truth
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {details?.resolution?.sourceOfTruth ?? "—"}
                </Typography>
              </Box>
            </Box>

            {details?.resolution?.edgeCases?.length ? (
              <>
                <Divider sx={{ my: 1.1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Edge cases
                </Typography>
                <Stack spacing={0.45} sx={{ mt: 0.6 }}>
                  {details.resolution.edgeCases.slice(0, 4).map((t) => (
                    <Typography key={t} variant="body2" color="text.secondary">
                      • {t}
                    </Typography>
                  ))}
                </Stack>
              </>
            ) : null}
          </Paper>
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

      {/* ABOUT (full-width row; no gap regardless of trade height) */}
      <Paper sx={panelSx}>
        <Typography variant="subtitle1" fontWeight={800}>
          About this market
        </Typography>
        <Divider sx={{ my: 0.9 }} />

        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
            },
            alignItems: "start",
          }}
        >
          <Stack spacing={0.8} minWidth={0}>
            <Typography variant="body2" color="text.secondary">
              {details?.summary ?? "—"}
            </Typography>

            <Divider />

            <Stack spacing={0.6}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                Payout
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {details?.resolution?.payout ?? "—"}
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1} minWidth={0}>
            <Box sx={infoCardSx}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                Sources
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.6 }}>
                {details?.sources?.length ? (
                  details.sources.map((s) => (
                    <Link
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      underline="hover"
                      fontSize={13}
                      fontWeight={700}
                      sx={{
                        display: "block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.label}
                    </Link>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </Stack>
            </Box>

            {relatedMarkets.length > 0 ? (
              <Box sx={infoCardSx}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Related markets
                </Typography>
                <Stack spacing={0.55} sx={{ mt: 0.6 }}>
                  {relatedMarkets.slice(0, 6).map((rm) => (
                    <Link
                      key={rm.id}
                      component={RouterLink}
                      to={`/markets/${rm.id}`}
                      underline="hover"
                      fontSize={13}
                      fontWeight={800}
                      sx={{
                        display: "block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rm.question}
                    </Link>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Box>
      </Paper>

      {/* TRADES + ORDER BOOK */}
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

      {/* CHAT */}
      <Paper sx={panelSx}>
        {chatLoading ? <MarketChatSkeleton /> : <MarketChat marketId={market.id} />}
      </Paper>
    </Box>
  );
}
