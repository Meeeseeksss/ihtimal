import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Market } from "../data/mockMarkets";
import { CategoryBadge } from "./CategoryBadge";

type SortKey = "question" | "yes" | "no" | "volume" | "closes";
type SortDir = "asc" | "desc";

function cents(p: number) {
  return Math.round(p * 100);
}

function usd(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function MarketsTable({ markets }: { markets: Market[] }) {
  const nav = useNavigate();

  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...markets];

    arr.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;

      switch (sortKey) {
        case "question":
          av = a.question.toLowerCase();
          bv = b.question.toLowerCase();
          break;
        case "yes":
          av = a.yesPrice;
          bv = b.yesPrice;
          break;
        case "no":
          av = 1 - a.yesPrice;
          bv = 1 - b.yesPrice;
          break;
        case "volume":
          av = a.volumeUsd;
          bv = b.volumeUsd;
          break;
        case "closes":
          av = new Date(a.resolvesAt).getTime();
          bv = new Date(b.resolvesAt).getTime();
          break;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [markets, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <Header
                label="Market"
                active={sortKey === "question"}
                dir={sortDir}
                onClick={() => toggleSort("question")}
              />
              <Header
                label="Yes"
                align="right"
                active={sortKey === "yes"}
                dir={sortDir}
                onClick={() => toggleSort("yes")}
              />
              <Header
                label="No"
                align="right"
                active={sortKey === "no"}
                dir={sortDir}
                onClick={() => toggleSort("no")}
              />
              <Header
                label="Volume"
                align="right"
                active={sortKey === "volume"}
                dir={sortDir}
                onClick={() => toggleSort("volume")}
              />
              <Header
                label="Closes"
                active={sortKey === "closes"}
                dir={sortDir}
                onClick={() => toggleSort("closes")}
              />
              <TableCell>Tags</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.map((m) => {
              const yes = m.yesPrice;
              const no = 1 - m.yesPrice;

              return (
                <TableRow
                  key={m.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => nav(`/markets/${m.id}`)}
                >
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography variant="body2" sx={{ fontWeight: 750 }}>
                      {m.question}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {m.id}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <PriceCell price={yes} />
                  </TableCell>

                  <TableCell align="right">
                    <PriceCell price={no} />
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {usd(m.volumeUsd)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {new Date(m.resolvesAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {new Date(m.resolvesAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      <CategoryBadge category={m.category} />
                      <Chip size="small" label={m.jurisdiction} variant="outlined" />
                      <Chip size="small" label={m.status} variant="outlined" />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

/* ---------- helpers ---------- */

function Header({
  label,
  active,
  dir,
  onClick,
  align,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "right";
}) {
  return (
    <TableCell align={align}>
      <TableSortLabel
        active={active}
        direction={active ? dir : "asc"}
        onClick={onClick}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function PriceCell({ price }: { price: number }) {
  return (
    <Box sx={{ display: "inline-flex", gap: 0.75, alignItems: "baseline" }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {cents(price)}¢
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {Math.round(price * 100)}%
      </Typography>
    </Box>
  );
}
