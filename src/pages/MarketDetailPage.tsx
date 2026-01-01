import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

export function MarketDetailPage() {
  const { id } = useParams();
  const market = useMemo(() => mockMarkets.find((m) => m.id === id), [id]);
  const [range, setRange] = useState<TimeRangeKey>("1D");

  if (!market) return <Typography sx={{ pt: 2 }}>Market not found.</Typography>;

  const seriesByRange = mockHistoryByMarketId[market.id];
  const book = mockOrderBookByMarketId[market.id];

  return (
    <Box sx={{ display: "grid", gap: 1.75, pt: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
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
        {/* Left: rules + order book */}
        <Stack spacing={1.75}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Rules</Typography>
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <b>Resolution criteria:</b> This market resolves to YES if the stated condition
              is met by the deadline, otherwise NO.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              <b>Source of truth:</b> Official data provider (configured per market).
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              <b>Payout:</b> Winning shares pay $1. Losing shares pay $0.
            </Typography>
          </Paper>

          {book && <OrderBook book={book} />}
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

        {/* Right: trade */}
        <Box sx={{ position: { xl: "sticky" }, top: { xl: 80 } }}>
          <ResponsiveTrade
            marketId={market.id}
            yesPrice={market.yesPrice}
            orderBook={book}
          />
        </Box>
      </Box>
    </Box>
  );
}
