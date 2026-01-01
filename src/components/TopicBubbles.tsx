import { Box, Chip } from "@mui/material";

const TOPICS = [
  "2026 Election",
  "Bitcoin",
  "Fed Rates",
  "AI Regulation",
  "World Cup",
  "Ethereum",
  "Inflation",
  "US Politics",
];

export function TopicBubbles() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        overflowX: "auto",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {TOPICS.map((t) => (
        <Chip
          key={t}
          label={t}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Box>
  );
}
