import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { PricePoint, TimeRangeKey } from "../data/mockMarketExtras";
import { useMemo } from "react";

function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export function PriceChart({
  seriesByRange,
  range,
  onRangeChange,
}: {
  seriesByRange: Record<TimeRangeKey, PricePoint[]>;
  range: TimeRangeKey;
  onRangeChange: (r: TimeRangeKey) => void;
}) {
  const data = seriesByRange[range] ?? [];
  const last = data.length ? data[data.length - 1].yes : 0.5;

  const domain = useMemo(() => {
    const ys = data.map((p) => p.yes);
    const min = Math.min(...ys, 0.01);
    const max = Math.max(...ys, 0.99);
    const pad = Math.max(0.02, (max - min) * 0.15);
    return [Math.max(0, min - pad), Math.min(1, max + pad)] as [number, number];
  }, [data]);

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Current YES: <b style={{ color: "#111827" }}>{Math.round(last * 100)}%</b>
        </Typography>

        <ToggleButtonGroup
          size="small"
          value={range}
          exclusive
          onChange={(_, v) => v && onRangeChange(v)}
        >
          <ToggleButton value="1H">1H</ToggleButton>
          <ToggleButton value="1D">1D</ToggleButton>
          <ToggleButton value="1W">1W</ToggleButton>
          <ToggleButton value="ALL">ALL</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid opacity={0.25} vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(t) => {
                const d = new Date(t);
                return range === "1H"
                  ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
                  : `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              minTickGap={28}
            />
            <YAxis
              domain={domain}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              width={46}
            />
            <Tooltip
              formatter={(v: any) => `${Math.round((v as number) * 100)}%`}
              labelFormatter={(t: any) => fmtTime(t as number)}
            />
            <Line type="monotone" dataKey="yes" dot={false} strokeWidth={2.25} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
