import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Slide,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { forwardRef, useState } from "react";

import { TradePanel } from "./TradePanel";
import type { OrderBook } from "../data/mockMarketExtras";

const Transition = forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ResponsiveTrade({
  marketId,
  yesPrice,
  orderBook,
  isTradingDisabled,
  tradingDisabledReason,
}: {
  marketId: string;
  yesPrice: number;
  orderBook?: OrderBook;
  isTradingDisabled?: boolean;
  tradingDisabledReason?: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(false);

  // ---------- DESKTOP ----------
  if (!isMobile) {
    return (
      <TradePanel
        marketId={marketId}
        yesPrice={yesPrice}
        orderBook={orderBook}
        isTradingDisabled={isTradingDisabled}
        tradingDisabledReason={tradingDisabledReason}
      />
    );
  }

  // ---------- MOBILE ----------
  return (
    <>
      {/* Trade CTA — hidden when modal is open */}
      {!open && (
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            py: 1.25,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Trade
        </Button>
      )}

      <Dialog
        open={open}
        fullScreen
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
          },
        }}
      >
        {/* Top bar with close */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close trade"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Trade content */}
        <Box sx={{ p: 1.25 }}>
          <Paper elevation={0}>
            <TradePanel
              marketId={marketId}
              yesPrice={yesPrice}
              orderBook={orderBook}
              isTradingDisabled={isTradingDisabled}
              tradingDisabledReason={tradingDisabledReason}
              onRequestClose={() => setOpen(false)}
            />
          </Paper>
        </Box>
      </Dialog>
    </>
  );
}
