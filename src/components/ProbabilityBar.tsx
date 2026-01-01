import { Box, LinearProgress, Typography } from "@mui/material";

export function ProbabilityBar({ yesPrice }: { yesPrice: number }) {
  const pct = Math.round(yesPrice * 100);
  return (
    <Box sx={{ display: "grid", gap: 0.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>YES</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": { borderRadius: 999 },
        }}
      />
    </Box>
  );
}
