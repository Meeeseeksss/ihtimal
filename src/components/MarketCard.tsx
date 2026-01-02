import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { Market } from "../data/mockMarkets";
import { useWatchlist } from "../data/watchlist";

function pct(p: number) {
  return Math.round(p * 100);
}

function usd(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// 🔒 SINGLE SOURCE OF TRUTH
const CARD_HEIGHT = 240;
const TITLE_LINES = 3;
const TITLE_LINE_HEIGHT = 1.3;
const THUMB_SIZE = 44;
const WATCH_BUTTON_SPACE_PX = 52; // keeps text from tucking under the top-right star

export function MarketCard({
  market,
  sx,
}: {
  market: Market;
  sx?: SxProps<Theme>;
}) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(market.id);

  return (
    <Card
      component={RouterLink}
      to={`/markets/${market.id}`}
      sx={[
        {
          textDecoration: "none",
          color: "inherit",
          height: CARD_HEIGHT,
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {/* Watch button */}
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
        <Tooltip title={watched ? "Remove from watchlist" : "Add to watchlist"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(market.id);
            }}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "background.default" },
            }}
            aria-label={watched ? "Unwatch market" : "Watch market"}
          >
            {watched ? (
              <StarRoundedIcon fontSize="small" />
            ) : (
              <StarBorderRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
          pt: 2.25,
          pr: `${WATCH_BUTTON_SPACE_PX}px`,
        }}
      >
        {/* Top row: placeholder image + title (clamped). */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", minWidth: 0 }}>
          <Box
            aria-hidden
            sx={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: 2,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              flex: "0 0 auto",
            }}
          />

          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              lineHeight: TITLE_LINE_HEIGHT,
              display: "-webkit-box",
              WebkitLineClamp: TITLE_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: `${TITLE_LINES * TITLE_LINE_HEIGHT}em`,
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            {market.question}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
          >
            YES {pct(market.yesPrice)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct(market.yesPrice)}
            sx={{ height: 6, borderRadius: 999 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, flex: "0 0 auto", minWidth: 0 }}>
            {pct(market.yesPrice)}¢
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{
              flex: "1 1 auto",
              textAlign: "right",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            Vol {usd(market.volumeUsd)}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", minWidth: 0 }}>
          <Chip size="small" label={market.category} variant="outlined" />
          <Chip size="small" label={market.status} variant="outlined" />
        </Box>
      </CardContent>
    </Card>
  );
}
