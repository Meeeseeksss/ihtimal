import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { mockMarkets } from "../data/mockMarkets";
import { useAccountStore, accountActions } from "../data/accountStore";

function marketTitle(marketId: string) {
  return mockMarkets.find((m) => m.id === marketId)?.question ?? marketId;
}

function fmtUsd(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function ActivityPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState(0);

  const trades = useAccountStore((s) => s.trades);
  const orders = useAccountStore((s) => s.openOrders);
  const txs = useAccountStore((s) => s.transactions);

  const tradesSorted = useMemo(() => [...trades].sort((a, b) => b.ts - a.ts), [trades]);
  const ordersSorted = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt), [orders]);
  const txsSorted = useMemo(() => [...txs].sort((a, b) => b.ts - a.ts), [txs]);

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5">Activity</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Trades, open orders, and transactions (stateful mock)
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => accountActions.reset()}>
          Reset mock account
        </Button>
      </Stack>

      <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, pt: 1 }}>
            <Tab label="Trades" />
            <Tab label="Open orders" />
            <Tab label="Transactions" />
          </Tabs>
          <Divider />

          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Trades
                </Typography>

                {isMobile ? (
                  <Stack spacing={1}>
                    {tradesSorted.slice(0, 120).map((t) => (
                      <Card key={t.id} variant="outlined" sx={{ borderColor: "divider" }}>
                        <CardContent sx={{ display: "grid", gap: 0.75 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                            <Chip size="small" label={t.side} color={t.side === "YES" ? "primary" : "error"} variant="outlined" />
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                              {Math.round(t.price * 100)}¢ • {t.shares.toFixed(0)}
                            </Typography>
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {marketTitle(t.marketId)}
                          </Typography>

                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {new Date(t.ts).toLocaleString()} • ${(t.price * t.shares).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Market</TableCell>
                        <TableCell>Side</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Shares</TableCell>
                        <TableCell align="right">Notional</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tradesSorted.slice(0, 120).map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell>{new Date(t.ts).toLocaleString()}</TableCell>
                          <TableCell sx={{ maxWidth: 520 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {marketTitle(t.marketId)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {t.marketId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={t.side} color={t.side === "YES" ? "primary" : "error"} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{Math.round(t.price * 100)}¢</TableCell>
                          <TableCell align="right">{t.shares.toFixed(0)}</TableCell>
                          <TableCell align="right">${(t.price * t.shares).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Open orders
                </Typography>

                {isMobile ? (
                  <Stack spacing={1}>
                    {ordersSorted.map((o) => (
                      <Card key={o.id} variant="outlined" sx={{ borderColor: "divider" }}>
                        <CardContent sx={{ display: "grid", gap: 0.75 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                            <Chip size="small" label={`${o.action} ${o.side}`} color={o.side === "YES" ? "primary" : "error"} variant="outlined" />
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                              {Math.round(o.limitPrice * 100)}¢ • {o.shares.toFixed(0)}
                            </Typography>
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {marketTitle(o.marketId)}
                          </Typography>

                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {new Date(o.createdAt).toLocaleString()}
                          </Typography>

                          <Button size="small" variant="outlined" onClick={() => accountActions.cancelOrder(o.id)}>
                            Cancel
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Placed</TableCell>
                        <TableCell>Market</TableCell>
                        <TableCell>Order</TableCell>
                        <TableCell align="right">Limit</TableCell>
                        <TableCell align="right">Shares</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ordersSorted.map((o) => (
                        <TableRow key={o.id} hover>
                          <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                          <TableCell sx={{ maxWidth: 520 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {marketTitle(o.marketId)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {o.marketId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={`${o.action} ${o.side}`} color={o.side === "YES" ? "primary" : "error"} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{Math.round(o.limitPrice * 100)}¢</TableCell>
                          <TableCell align="right">{o.shares.toFixed(0)}</TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => accountActions.cancelOrder(o.id)}>
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Transactions
                </Typography>

                {isMobile ? (
                  <Stack spacing={1}>
                    {txsSorted.slice(0, 160).map((tx) => (
                      <Card key={tx.id} variant="outlined" sx={{ borderColor: "divider" }}>
                        <CardContent sx={{ display: "grid", gap: 0.75 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                            <Chip size="small" label={tx.type} variant="outlined" />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 900,
                                color: tx.amountUsd > 0 ? "success.main" : tx.amountUsd < 0 ? "error.main" : "text.primary",
                              }}
                            >
                              {fmtUsd(tx.amountUsd)}
                            </Typography>
                          </Box>

                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {new Date(tx.ts).toLocaleString()}
                          </Typography>

                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {tx.note ?? "—"}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {txsSorted.slice(0, 160).map((tx) => (
                        <TableRow key={tx.id} hover>
                          <TableCell>{new Date(tx.ts).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip size="small" label={tx.type} variant="outlined" />
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary" }}>{tx.note ?? "—"}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 800,
                              color: tx.amountUsd > 0 ? "success.main" : tx.amountUsd < 0 ? "error.main" : "text.primary",
                            }}
                          >
                            {fmtUsd(tx.amountUsd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
