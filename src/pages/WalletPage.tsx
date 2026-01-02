import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useNotify } from "../app/notifications";
import { useAccountStore, accountActions } from "../data/accountStore";

function fmtUsd(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function WalletPage() {
  const notify = useNotify();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const cash = useAccountStore((s) => s.walletCashUsd);
  const txs = useAccountStore((s) => s.transactions);

  const [open, setOpen] = useState<null | "DEPOSIT" | "WITHDRAW">(null);
  const [amount, setAmount] = useState("100");

  const txsSorted = useMemo(() => [...txs].sort((a, b) => b.ts - a.ts), [txs]);

  const amt = Number(amount);
  const canSubmit = Number.isFinite(amt) && amt > 0;

  function submit() {
    if (!canSubmit) return;

    if (open === "DEPOSIT") {
      accountActions.deposit(amt);
      notify({ severity: "success", message: `Deposit submitted (mock): +$${amt.toFixed(2)}` });
      setOpen(null);
      return;
    }

    if (open === "WITHDRAW") {
      const ok = accountActions.withdraw(amt);
      if (!ok) {
        notify({ severity: "error", message: "Insufficient balance (mock)" });
        return;
      }
      notify({ severity: "success", message: `Withdrawal submitted (mock): −$${amt.toFixed(2)}` });
      setOpen(null);
    }
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box>
        <Typography variant="h5">Wallet</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Funding & transaction history (stateful mock)
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Cash balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
              ${cash.toFixed(2)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setOpen("DEPOSIT")}>
                Deposit
              </Button>
              <Button variant="outlined" onClick={() => setOpen("WITHDRAW")}>
                Withdraw
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              This is a mock account store persisted in localStorage.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Quick info
            </Typography>
            <Divider sx={{ my: 1.25 }} />
            <Stack spacing={0.75}>
              <Row label="Account status" value="Unverified (mock)" />
              <Row label="Limits" value="$5,000/day (mock)" />
              <Row label="Settlement" value="T+0 (mock)" />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <CardContent sx={{ display: "grid", gap: 1 }}>
          <Typography variant="h6">Transactions</Typography>
          <Divider />

          {isMobile ? (
            <Stack spacing={1}>
              {txsSorted.slice(0, 120).map((tx) => (
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
        </CardContent>
      </Card>

      <Dialog open={open != null} onClose={() => setOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{open === "DEPOSIT" ? "Deposit" : "Withdraw"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 1.25, pt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Mock modal. This updates the local account store.
          </Typography>

          <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!canSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Stack>
  );
}
