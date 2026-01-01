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
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { MARKET_SORT_LABELS, sanitizeSort, type MarketSortKey } from "../data/marketSort";

export type MarketFilterState = {
  query: string;
  status: "ALL" | "TRADING" | "HALTED" | "RESOLVED";
  category: "ALL" | "CRYPTO" | "POLITICS" | "SPORTS";
  minVolume: number;
};

export function MarketFilters({
  value,
  onChange,
  sort,
  onSortChange,
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

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.2fr 0.85fr 1fr 1.5fr",
          },
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search markets"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
        />

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

        <ToggleButtonGroup
          size="small"
          exclusive
          value={value.status}
          onChange={(_, v) => v && onChange({ ...value, status: v })}
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="TRADING">Trading</ToggleButton>
          <ToggleButton value="HALTED">Halted</ToggleButton>
          <ToggleButton value="RESOLVED">Resolved</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ px: 1 }}>
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
