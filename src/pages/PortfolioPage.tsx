import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  // Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { mockPnlSeries } from "../data/mockMarketExtras";
import { useAccountStore } from "../data/accountStore";

function usd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function positionUnrealizedPnl(pos: any) {
  const yes = clamp01(pos.currentYes ?? 0.5);
  const mark = pos.side === "YES" ? yes : (1 - yes);
  return (mark - pos.avgPrice) * pos.shares;
}

export function PortfolioPage() {
  const positions = useAccountStore((s) => s.positions.filter((p) => p.status === "OPEN" && p.shares > 0));
  const unrealized = positions.reduce((s, p) => s + positionUnrealizedPnl(p), 0);
  const lastPnl = mockPnlSeries[mockPnlSeries.length - 1]?.pnl ?? 0;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box>
        <Typography variant="h5">Portfolio</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Track performance and open exposure.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>30D PnL</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{usd(lastPnl)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Unrealized PnL</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{usd(unrealized)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Open Positions</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{positions.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <CardContent sx={{ display: "grid", gap: 1 }}>
          <Typography variant="h6">PnL (30 days)</Typography>
          <Divider />
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPnlSeries}>
                <CartesianGrid opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="t"
                  tickFormatter={(t) => {
                    const d = new Date(t);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  minTickGap={24}
                />
                <YAxis tickFormatter={(v) => `$${Math.round(v)}`} width={56} />
                <Tooltip
                  labelFormatter={(t) => new Date(t as number).toLocaleDateString()}
                  formatter={(v: any) => usd(v as number)}
                />
                <Line type="monotone" dataKey="pnl" dot={false} strokeWidth={2.2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <CardContent sx={{ display: "grid", gap: 1 }}>
          <Typography variant="h6">Open positions</Typography>
          <Divider />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Market</TableCell>
                <TableCell>Side</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Avg</TableCell>
                <TableCell align="right">Unrealized</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((p) => {
                const upnl = positionUnrealizedPnl(p);

                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ maxWidth: 420 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {p.question}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {p.marketId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={p.side} color={p.side === "YES" ? "primary" : "error"} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{p.shares.toLocaleString()}</TableCell>
                    <TableCell align="right">{Math.round(p.avgPrice * 100)}¢</TableCell>
                    <TableCell align="right">{usd(upnl)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.status} variant="outlined" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
