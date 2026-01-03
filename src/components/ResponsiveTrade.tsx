import {
  Backdrop,
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useRef, useState } from "react";

import { TradePanel } from "./TradePanel";
import type { OrderBook } from "../data/mockMarketExtras";
import { mockMarkets } from "../data/mockMarkets";

function isTextInputEl(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase?.() ?? "";
  if (tag === "input" || tag === "textarea") return true;
  // contenteditable elements
  // @ts-ignore
  if ((el as any).isContentEditable) return true;
  return false;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

type SnapKey = "HALF" | "FULL";

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

  // Track whether user is typing in an input inside the sheet.
  const [isTyping, setIsTyping] = useState(false);

  // Keyboard lift: how much the keyboard overlaps from bottom.
  const [keyboardInset, setKeyboardInset] = useState(0);

  // Snap + drag state
  const [snap, setSnap] = useState<SnapKey>("HALF");
  const [heightPx, setHeightPx] = useState<number>(0);

  const sheetRootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startY: number;
    startH: number;
    lastY: number;
    lastT: number;
    velocity: number; // px/ms
  }>({
    active: false,
    startY: 0,
    startH: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
  });

  const marketTitle = useMemo(() => {
    const m = mockMarkets.find((x) => x.id === marketId);
    return m?.question ?? "Trade";
  }, [marketId]);

  // Compute snap heights based on viewport height (supports keyboard via visualViewport when available)
  const getViewportH = () => {
    const vv = window.visualViewport;
    // visualViewport.height excludes the on-screen keyboard area in most mobile browsers
    return vv?.height ?? window.innerHeight;
  };

  const computeSnaps = () => {
    const vh = getViewportH();
    const FULL = Math.round(vh * 0.92);
    const HALF = Math.round(vh * 0.56);
    return { HALF, FULL };
  };

  // Initialize / update height on open, resize, orientation change, viewport changes (keyboard)
  useEffect(() => {
    if (!isMobile) return;

    const apply = () => {
      const { HALF, FULL } = computeSnaps();
      const target = snap === "FULL" ? FULL : HALF;
      setHeightPx((prev) => {
        // If closed, don't fight updates
        if (!open) return prev;
        // If user is dragging, don't jump height here
        if (dragRef.current.active) return prev;
        return target;
      });
    };

    const onResize = () => apply();

    window.addEventListener("resize", onResize);

    const vv = window.visualViewport;
    const onVV = () => {
      // keyboardInset = how much of the layout viewport is covered from bottom
      // when visualViewport shrinks, innerHeight - vv.height is overlap-ish.
      const inset = Math.max(0, window.innerHeight - (vv?.height ?? window.innerHeight));
      setKeyboardInset(inset);
      apply();
    };

    if (vv) {
      vv.addEventListener("resize", onVV);
      vv.addEventListener("scroll", onVV);
      onVV();
    }

    // Apply once
    apply();

    return () => {
      window.removeEventListener("resize", onResize);
      if (vv) {
        vv.removeEventListener("resize", onVV);
        vv.removeEventListener("scroll", onVV);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, open, snap]);

  // When opening: start at HALF snap
  useEffect(() => {
    if (!open) return;
    setSnap("HALF");
    const { HALF } = computeSnaps();
    setHeightPx(HALF);
  }, [open]);

  // Focus tracking to prevent accidental close while typing
  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      return;
    }

    const root = sheetRootRef.current;
    if (!root) return;

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (isTextInputEl(t)) setIsTyping(true);
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        setIsTyping(isTextInputEl(document.activeElement));
      }, 0);
    };

    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    return () => {
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  // ESC to close (disabled while typing)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isTyping) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isTyping]);

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

  const { HALF, FULL } = (() => {
    if (typeof window === "undefined") return { HALF: 420, FULL: 720 };
    return computeSnaps();
  })();

  const minH = Math.min(HALF, FULL);
  const maxH = Math.max(HALF, FULL);

  const snapTo = (key: SnapKey) => {
    const target = key === "FULL" ? FULL : HALF;
    setSnap(key);
    setHeightPx(clamp(target, minH, maxH));
  };

  const settleSnap = (h: number, v: number) => {
    // v is px/ms, positive means moving down (reducing height)
    // Use velocity bias: fast up -> FULL, fast down -> HALF
    if (v < -0.7) return snapTo("FULL");
    if (v > 0.7) return snapTo("HALF");

    // Otherwise nearest snap
    const dHalf = Math.abs(h - HALF);
    const dFull = Math.abs(h - FULL);
    snapTo(dFull <= dHalf ? "FULL" : "HALF");
  };

  const onPointerDownHandle = (e: React.PointerEvent) => {
    // Only left click / touch
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const d = dragRef.current;
    d.active = true;
    d.startY = e.clientY;
    d.startH = heightPx || HALF;
    d.lastY = e.clientY;
    d.lastT = performance.now();
    d.velocity = 0;
  };

  const onPointerMoveHandle = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;

    const now = performance.now();
    const dy = e.clientY - d.startY; // down positive
    const nextH = clamp(d.startH - dy, minH, maxH);

    // velocity estimate (px/ms)
    const dt = Math.max(1, now - d.lastT);
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = now;

    setHeightPx(nextH);
  };

  const onPointerUpHandle = (_e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    settleSnap(heightPx || HALF, d.velocity);
  };

  // Backdrop click closes unless typing
  const closeFromBackdrop = () => {
    if (isTyping) return;
    setOpen(false);
  };

  return (
    <>
      {/* Sticky bottom Trade CTA (hidden when sheet open) */}
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

      {/* Backdrop */}
      <Backdrop
        open={open}
        onClick={closeFromBackdrop}
        sx={{ zIndex: 1200, bgcolor: "rgba(0,0,0,0.35)" }}
      />

      {/* Sheet */}
      {open ? (
        <Box
          ref={sheetRootRef}
          role="dialog"
          aria-modal="true"
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: keyboardInset, // ✅ keyboard lift
            zIndex: 1300,
            // Use transform for smoother animation
            transition: dragRef.current.active ? "none" : "height 180ms ease",
            height: heightPx || HALF,
            maxHeight: maxH,
            minHeight: minH,
            display: "flex",
            flexDirection: "column",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: "background.default",
            boxShadow: "0px -10px 30px rgba(0,0,0,0.20)",
            overflow: "hidden",
            // Safe area
            pb: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Drag handle area */}
          <Box
            onPointerDown={onPointerDownHandle}
            onPointerMove={onPointerMoveHandle}
            onPointerUp={onPointerUpHandle}
            onPointerCancel={onPointerUpHandle}
            sx={{
              pt: 1,
              pb: 0.75,
              px: 1.15,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              touchAction: "none", // important for smooth pointer drag
              userSelect: "none",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0.6 }}>
              <Box
                sx={{
                  width: 42,
                  height: 5,
                  borderRadius: 999,
                  bgcolor: "rgba(17,24,39,0.18)",
                }}
              />
            </Box>

            {/* Title row + snap controls */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
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

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {/* Quick snap toggles */}
                <Button
                  size="small"
                  variant={snap === "HALF" ? "contained" : "outlined"}
                  onClick={() => snapTo("HALF")}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, minWidth: 0, px: 1 }}
                >
                  Half
                </Button>
                <Button
                  size="small"
                  variant={snap === "FULL" ? "contained" : "outlined"}
                  onClick={() => snapTo("FULL")}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, minWidth: 0, px: 1 }}
                >
                  Full
                </Button>

                <IconButton
                  onClick={() => setOpen(false)} // X always closes
                  aria-label="Close trade"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Content area */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              px: 1.15,
              py: 1.15,
              pb: `calc(1.15rem + env(safe-area-inset-bottom))`,
            }}
          >
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
      ) : null}
    </>
  );
}
