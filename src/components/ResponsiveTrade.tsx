import { Drawer, Fab, Box, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { useState } from "react";
import { TradePanel, type TradePreset } from "./TradePanel";
import type { OrderBook } from "../data/mockMarketExtras";

export function ResponsiveTrade({
  marketId,
  yesPrice,
  orderBook,
  isTradingDisabled,
  tradingDisabledReason,
  presetKey,
  preset,
}: {
  marketId: string;
  yesPrice: number;
  orderBook?: OrderBook;

  /** When true, disables the ticket (e.g. HALTED / RESOLVED). */
  isTradingDisabled?: boolean;
  /** Optional copy shown when trading is disabled. */
  tradingDisabledReason?: string;

  presetKey?: number;
  preset?: TradePreset;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const hasBottomNav = useMediaQuery(theme.breakpoints.down("md"));
  const fabBottom = hasBottomNav ? 80 : 16; // avoid overlap with mobile bottom nav
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <TradePanel
        marketId={marketId}
        yesPrice={yesPrice}
        orderBook={orderBook}
        isTradingDisabled={isTradingDisabled}
        tradingDisabledReason={tradingDisabledReason}
        presetKey={presetKey}
        preset={preset}
      />
    );
  }

  return (
    <>
      <Fab
        color="primary"
        variant="extended"
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", right: 16, bottom: fabBottom, zIndex: 1400 }}
      >
        <SwapVertIcon sx={{ mr: 1 }} />
        Trade
      </Fab>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "86vh",
            pb: 2,
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ width: 36, height: 4, bgcolor: "rgba(17,24,39,0.25)", borderRadius: 999, mx: "auto" }} />
          <IconButton onClick={() => setOpen(false)} aria-label="close trade sheet">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Trade ticket
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Review cost, fees, and max loss before placing orders.
          </Typography>
        </Box>

        <Box sx={{ px: 2 }}>
          <TradePanel
            marketId={marketId}
            yesPrice={yesPrice}
            orderBook={orderBook}
            isTradingDisabled={isTradingDisabled}
            tradingDisabledReason={tradingDisabledReason}
            onRequestClose={() => setOpen(false)}
            presetKey={presetKey}
            preset={preset}
          />
        </Box>
      </Drawer>
    </>
  );
}
