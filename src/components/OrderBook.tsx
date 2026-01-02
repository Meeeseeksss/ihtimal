// src/components/OrderBook.tsx
import { Box, Divider, Paper, Typography } from "@mui/material";
import type { OrderBook as OrderBookT, OrderBookLevel } from "../data/mockMarketExtras";

function cents(p: number) {
  return Math.round(p * 100);
}

function totalQty(levels: OrderBookLevel[]) {
  return levels.reduce((s, l) => s + l.qty, 0);
}

function Row({
  price,
  qty,
  maxQty,
  side,
}: {
  price: number;
  qty: number;
  maxQty: number;
  side: "ASK" | "BID";
}) {
  const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;

  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "70px 1fr 70px",
        gap: 1,
        py: 0.5,
        px: 1,
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: side === "ASK" ? 0 : "auto",
          left: side === "BID" ? 0 : "auto",
          width: `${pct}%`,
          bgcolor: side === "ASK" ? "rgba(217,48,37,0.10)" : "rgba(15,157,88,0.10)",
          pointerEvents: "none",
        }}
      />
      <Typography variant="body2" sx={{ fontWeight: 850, position: "relative" }}>
        {cents(price)}¢
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", position: "relative" }}>
        {qty.toLocaleString()} sh
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", textAlign: "right", position: "relative" }}
      >
        ${(price * qty).toFixed(0)}
      </Typography>
    </Box>
  );
}

function OrderBookBody({ book }: { book: OrderBookT }) {
  const bestAsk = book.asks[0]?.price ?? 0;
  const bestBid = book.bids[0]?.price ?? 0;
  const spread = Math.max(0, bestAsk - bestBid);

  const maxAskQty = Math.max(...book.asks.map((l) => l.qty), 1);
  const maxBidQty = Math.max(...book.bids.map((l) => l.qty), 1);

  const askTotal = totalQty(book.asks);
  const bidTotal = totalQty(book.bids);

  return (
    <>
      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: "grid", gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          ASKS
        </Typography>
        {book.asks.map((l, i) => (
          <Row key={`a-${i}`} price={l.price} qty={l.qty} maxQty={maxAskQty} side="ASK" />
        ))}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Total ask liquidity: <b>{askTotal.toLocaleString()}</b> shares
        </Typography>
      </Box>

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: "grid", gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          BIDS
        </Typography>
        {book.bids.map((l, i) => (
          <Row key={`b-${i}`} price={l.price} qty={l.qty} maxQty={maxBidQty} side="BID" />
        ))}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Total bid liquidity: <b>{bidTotal.toLocaleString()}</b> shares
        </Typography>
      </Box>

      {/* keep spread available for parents that render headers */}
      <Box sx={{ display: "none" }} data-spread-cents={Math.round(spread * 100)} />
    </>
  );
}

export function OrderBook({
  book,
  embedded = false,
}: {
  book: OrderBookT;
  embedded?: boolean;
}) {
  const bestAsk = book.asks[0]?.price ?? 0;
  const bestBid = book.bids[0]?.price ?? 0;
  const spread = Math.max(0, bestAsk - bestBid);

  if (embedded) {
    return (
      <Box sx={{ width: "100%" }}>
        <OrderBookBody book={book} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Typography variant="h6">Order book</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Spread: <b>{Math.round(spread * 100)}¢</b>
        </Typography>
      </Box>
      <OrderBookBody book={book} />
    </Paper>
  );
}
