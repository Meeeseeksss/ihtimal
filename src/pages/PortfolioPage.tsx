import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Button,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { mockPnlSeries } from "../data/mockMarketExtras";
import { useAccountStore } from "../data/accountStore";
import { mockMarkets } from "../data/mockMarkets";

function usd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function positionUnrealizedPnl(pos: any) {
  const yes = clamp01(pos.currentYes ?? 0.5);
  const mark = pos.side === "YES" ? yes : 1 - yes;
  return (mark - pos.avgPrice) * pos.shares;
}

function marketYesPrice(marketId: string): number {
  return mockMarkets.find((m) => m.id === marketId)?.yesPrice ?? 0.5;
}

export function PortfolioPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [sideFilter, setSideFilter] = useState<"ALL" | "YES" | "NO">("ALL");
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "CLOSED" | "ALL">("OPEN");

  const positionsAll = useAccountStore((s) => s.positions);
  const txs = useAccountStore((s) => s.transactions);

  // Keep currentYes reasonably updated from mockMarkets (UI-only)
  const positions = useMemo(() => {
    return positionsAll.map((p) => {
      const yes = marketYesPrice(p.marketId);
      return { ...p, currentYes: yes };
    });
  }, [positionsAll]);

  const openPositions = useMemo(() => positions.filter((p) => p.status === "OPEN" && p.shares > 0), [positions]);
  const closedPositions = useMemo(() => positions.filter((p) => p.status !== "OPEN" || p.shares <= 0), [positions]);

  const filteredPositions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return positions
      .filter((p) => {
        if (statusFilter !== "ALL") {
          if (statusFilter === "OPEN" && !(p.status === "OPEN" && p.shares > 0)) return false;
          if (statusFilter === "CLOSED" && !(p.status !== "OPEN" || p.shares <= 0)) return false;
        }
        if (sideFilter !== "ALL" && p.side !== sideFilter) return false;
        if (needle) {
          const hay = `${p.question} ${p.marketId}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.shares * b.avgPrice) - (a.shares * a.avgPrice));
  }, [positions, q, sideFilter, statusFilter]);

  const unrealized = useMemo(() => openPositions.reduce((s, p) => s + positionUnrealizedPnl(p), 0), [openPositions]);
  const exposure = useMemo(() => openPositions.reduce((s, p) => s + p.shares * p.avgPrice, 0), [openPositions]);
  const lastPnl = mockPnlSeries[mockPnlSeries.length - 1]?.pnl ?? 0;

  const tradingCashFlow30d = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return txs
      .filter((t) => t.ts >= cutoff && (t.type === "TRADE" || t.type === "TRADE_FEE"))
      .reduce((s, t) => s + t.amountUsd, 0);
  }, [txs]);

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box>
        <Typography variant="h5">Portfolio</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Positions, exposure, and activity-derived metrics (stateful mock)
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" } }}>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              30D PnL (mock series)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {usd(lastPnl)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Unrealized PnL
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {usd(unrealized)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Exposure (cost basis)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {usd(exposure)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              30D trade cashflow
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {usd(tradingCashFlow30d)}
            </Typography>
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
                  labelFormatter={(t) => new Date(t as number).toLocaleDateString()
                  }
                  formatter={(v: any) => usd(v as number)}
                />
                <Line type="monotone" dataKey="pnl" dot={false} strokeWidth={2.2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, pt: 1 }}>
            <Tab label={`Positions (${openPositions.length})`} />
            <Tab label={`Closed (${closedPositions.length})`} />
          </Tabs>
          <Divider />

          <Box sx={{ p: 2, display: "grid", gap: 1.25 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
              <TextField
                size="small"
                placeholder="Search positions"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{ width: { xs: "100%", md: 360 } }}
              />

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <ToggleButtonGroup size="small" exclusive value={sideFilter} onChange={(_, v) => v && setSideFilter(v)}>
                  <ToggleButton value="ALL">All</ToggleButton>
                  <ToggleButton value="YES">YES</ToggleButton>
                  <ToggleButton value="NO">NO</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup size="small" exclusive value={statusFilter} onChange={(_, v) => v && setStatusFilter(v)}>
                  <ToggleButton value="OPEN">Open</ToggleButton>
                  <ToggleButton value="CLOSED">Closed</ToggleButton>
                  <ToggleButton value="ALL">All</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {isMobile ? (
              <Stack spacing={1}>
                {filteredPositions
                  .filter((p) => (tab === 0 ? p.status === "OPEN" && p.shares > 0 : p.status !== "OPEN" || p.shares <= 0))
                  .slice(0, 80)
                  .map((p) => {
                    const upnl = positionUnrealizedPnl(p);
                    const mark = p.side === "YES" ? p.currentYes : 1 - p.currentYes;
                    return (
                      <Card
                        key={p.id}
                        variant="outlined"
                        sx={{ borderColor: "divider" }}
                        onClick={() => navigate(`/markets/${p.marketId}`)}
                      >
                        <CardContent sx={{ display: "grid", gap: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                            {p.question}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                            <Chip size="small" label={p.side} color={p.side === "YES" ? "primary" : "error"} variant="outlined" />
                            <Chip size="small" label={p.status} variant="outlined" />
                            <Chip size="small" label={`${Math.round(mark * 100)}¢ mark`} variant="outlined" />
                          </Box>
                          <Divider />
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Shares</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{p.shares.toFixed(2)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Avg</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{Math.round(p.avgPrice * 100)}¢</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Unrealized</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{usd(upnl)}</Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            component={RouterLink}
                            to={`/markets/${p.marketId}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ justifySelf: "start", px: 0, fontWeight: 800 }}
                          >
                            View market
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </Stack>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Market</TableCell>
                    <TableCell>Side</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Avg</TableCell>
                    <TableCell align="right">Mark</TableCell>
                    <TableCell align="right">Unrealized</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPositions
                    .filter((p) => (tab === 0 ? p.status === "OPEN" && p.shares > 0 : p.status !== "OPEN" || p.shares <= 0))
                    .slice(0, 200)
                    .map((p) => {
                      const upnl = positionUnrealizedPnl(p);
                      const mark = p.side === "YES" ? p.currentYes : 1 - p.currentYes;

                      return (
                        <TableRow key={p.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/markets/${p.marketId}`)}>
                          <TableCell sx={{ maxWidth: 520 }}>
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
                          <TableCell align="right">{Math.round(mark * 100)}¢</TableCell>
                          <TableCell align="right">{usd(upnl)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={p.status} variant="outlined" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
