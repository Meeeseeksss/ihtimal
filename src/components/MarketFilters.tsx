import {
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { MARKET_SORT_LABELS, sanitizeSort, type MarketSortKey } from "../data/marketSort";

export type MarketFilterState = {
  query: string;
  status: "ALL" | "TRADING" | "HALTED" | "RESOLVED";
  category: "ALL" | "CRYPTO" | "POLITICS" | "SPORTS";
  minVolume: number;
};

const DEFAULT_STATE: MarketFilterState = {
  query: "",
  status: "ALL",
  category: "ALL",
  minVolume: 0,
};

export function MarketFilters({
  value,
  onChange,
  sort,
  onSortChange,
  resultCount,
  disableCategory,
}: {
  value: MarketFilterState;
  onChange: (v: MarketFilterState) => void;

  /**
   * IMPORTANT:
   * - sort is optional so pages that don't manage sort won't break
   * - Select must NEVER receive undefined (MUI warning)
   */
  sort?: MarketSortKey;
  onSortChange?: (s: MarketSortKey) => void;

  /** Optional label helper (e.g., “18 results”) */
  resultCount?: number;

  /** Use on dedicated pages (e.g. /categories/:category) where category is fixed. */
  disableCategory?: boolean;
}) {
  const isControlled = sort !== undefined;
  const [localSort, setLocalSort] = useState<MarketSortKey>(() => sanitizeSort(sort));

  useEffect(() => {
    if (!isControlled) return;
    setLocalSort(sanitizeSort(sort));
  }, [isControlled, sort]);

  const effectiveSort = useMemo(() => {
    return isControlled ? sanitizeSort(sort) : localSort;
  }, [isControlled, sort, localSort]);

  const isDirty =
    value.query !== DEFAULT_STATE.query ||
    value.status !== DEFAULT_STATE.status ||
    value.category !== DEFAULT_STATE.category ||
    value.minVolume !== DEFAULT_STATE.minVolume;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: "grid", gap: 1.25 }}>
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.8fr" },
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search markets"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            {typeof resultCount === "number" && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {resultCount.toLocaleString()} result{resultCount === 1 ? "" : "s"}
              </Typography>
            )}

            {isDirty ? (
              <Button size="small" variant="text" onClick={() => onChange({ ...DEFAULT_STATE })} sx={{ fontWeight: 800 }}>
                Clear
              </Button>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.85fr 1fr" },
            alignItems: "center",
          }}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={value.category}
            onChange={(_, v) => v && onChange({ ...value, category: v })}
            disabled={disableCategory}
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="CRYPTO">Crypto</ToggleButton>
            <ToggleButton value="POLITICS">Politics</ToggleButton>
            <ToggleButton value="SPORTS">Sports</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small" exclusive value={value.status} onChange={(_, v) => v && onChange({ ...value, status: v })}>
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="TRADING">Trading</ToggleButton>
            <ToggleButton value="HALTED">Halted</ToggleButton>
            <ToggleButton value="RESOLVED">Resolved</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={effectiveSort}
              onChange={(e) => {
                const next = sanitizeSort(e.target.value);
                if (!isControlled) setLocalSort(next);
                onSortChange?.(next);
              }}
              renderValue={(v) => MARKET_SORT_LABELS[v as MarketSortKey]}
            >
              <MenuItem value="TRENDING">Trending</MenuItem>
              <MenuItem value="VOLUME">Volume</MenuItem>
              <MenuItem value="NEWEST">Newest</MenuItem>
              <MenuItem value="CLOSING_SOON">Closing soon</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ px: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Min volume: ${value.minVolume.toLocaleString()}
          </Typography>
          <Slider
            value={value.minVolume}
            min={0}
            max={2_500_000}
            step={50_000}
            onChange={(_, v) => onChange({ ...value, minVolume: v as number })}
          />
        </Box>
      </Box>
    </Paper>
  );
}
