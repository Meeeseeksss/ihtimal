import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Slide,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { TradePanel } from "./TradePanel";
import type { OrderBook } from "../data/mockMarketExtras";
import { mockMarkets } from "../data/mockMarkets";

const Transition = forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function isTextInputEl(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase?.() ?? "";
  if (tag === "input" || tag === "textarea") return true;
  // contenteditable elements
  // @ts-ignore
  if ((el as any).isContentEditable) return true;
  return false;
}

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

  // Track whether the user is typing/focused in an input inside the modal.
  // While true: disable backdrop close + Escape close (X still works).
  const [isTyping, setIsTyping] = useState(false);
  const modalRootRef = useRef<HTMLDivElement | null>(null);

  const marketTitle = useMemo(() => {
    const m = mockMarkets.find((x) => x.id === marketId);
    return m?.question ?? "Trade";
  }, [marketId]);

  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      return;
    }

    const root = modalRootRef.current;
    if (!root) return;

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (isTextInputEl(t)) setIsTyping(true);
    };

    const onFocusOut = () => {
      // After focus leaves, check if another input is focused.
      window.setTimeout(() => {
        const active = document.activeElement;
        setIsTyping(isTextInputEl(active));
      }, 0);
    };

    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    return () => {
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

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
      {/* Sticky bottom CTA on mobile (hidden when modal open) */}
      {!open && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 5,
            mt: 1,
            pb: "env(safe-area-inset-bottom)",
          }}
        >
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              px: 1.15,
              py: 1,
            }}
          >
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={Boolean(isTradingDisabled)}
              onClick={() => setOpen(true)}
              sx={{
                py: 1.25,
                borderRadius: 2,
                fontWeight: 750,
                textTransform: "none",
              }}
            >
              {isTradingDisabled ? tradingDisabledReason || "Trading disabled" : "Trade"}
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={open}
        fullScreen
        TransitionComponent={Transition}
        // Only allow closing by backdrop/Esc when NOT typing.
        onClose={(_, reason) => {
          if (isTyping && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
          setOpen(false);
        }}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
          },
        }}
      >
        {/* Modal root to capture focus events */}
        <Box ref={modalRootRef} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Top bar: title + close */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 1,
              py: 0.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 750,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                pr: 1,
              }}
              title={marketTitle}
            >
              {marketTitle}
            </Typography>

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

          {/* Content */}
          <Box sx={{ p: 1.15, flex: 1, overflow: "auto" }}>
            <Paper elevation={0} sx={{ bgcolor: "transparent" }}>
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
        </Box>
      </Dialog>
    </>
  );
}
