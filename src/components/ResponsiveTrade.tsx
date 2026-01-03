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

  // Snap + drag state
  const [snap, setSnap] = useState<SnapKey>("HALF");
  const [heightPx, setHeightPx] = useState<number>(0);

  const sheetRootRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

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

  /**
   * ✅ IMPORTANT: do NOT use visualViewport for snap heights.
   * We want keyboard to overlay the sheet (no jump).
   */
  const getViewportH = () => window.innerHeight;

  const computeSnaps = () => {
    const vh = getViewportH();
    const FULL = Math.round(vh * 0.92);
    const HALF = Math.round(vh * 0.56);
    return { HALF, FULL };
  };

  // Bottom tab bar guard so the last content isn't hidden behind tab nav
  const BOTTOM_TAB_GUARD_PX = 76;

  // Init/update height on open + resize/orientation changes
  useEffect(() => {
    if (!isMobile) return;

    const apply = () => {
      const { HALF, FULL } = computeSnaps();
      const target = snap === "FULL" ? FULL : HALF;
      setHeightPx((prev) => {
        if (!open) return prev;
        if (dragRef.current.active) return prev;
        return target;
      });
    };

    const onResize = () => apply();
    window.addEventListener("resize", onResize);
    apply();

    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, open, snap]);

  // When opening: start at HALF snap
  useEffect(() => {
    if (!open) return;
    setSnap("HALF");
    const { HALF } = computeSnaps();
    setHeightPx(HALF);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus tracking + auto-scroll focused input into view
  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      return;
    }

    const root = sheetRootRef.current;
    if (!root) return;

    const scrollFocusedIntoView = (el: Element) => {
      const container = contentRef.current;
      if (!container) return;

      // We want the input comfortably above the bottom (keyboard + nav)
      const guardBottom = BOTTOM_TAB_GUARD_PX + 16;

      // compute element position inside scroll container
      const elRect = (el as HTMLElement).getBoundingClientRect();
      const cRect = container.getBoundingClientRect();

      // distance from top of scroll container viewport
      const topWithin = elRect.top - cRect.top;
      const bottomWithin = elRect.bottom - cRect.top;

      const visibleTop = 0;
      const visibleBottom = cRect.height - guardBottom;

      // If it's already visible enough, do nothing
      if (topWithin >= visibleTop + 8 && bottomWithin <= visibleBottom - 8) return;

      // Preferred target: bring it so its bottom sits a bit above visibleBottom
      const currentScroll = container.scrollTop;
      const delta = bottomWithin - (visibleBottom - 12);
      const nextScroll = Math.max(0, currentScroll + delta);

      container.scrollTo({ top: nextScroll, behavior: "smooth" });
    };

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (!t) return;

      if (isTextInputEl(t)) {
        setIsTyping(true);

        // Wait a tick so the browser can place caret + potentially start keyboard animation
        window.setTimeout(() => {
          scrollFocusedIntoView(t);
        }, 50);

        // Another pass a bit later (helps iOS where keyboard anim can be delayed)
        window.setTimeout(() => {
          scrollFocusedIntoView(t);
        }, 250);
      }
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        setIsTyping(isTextInputEl(document.activeElement));
      }, 0);
    };

    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    // Also re-check on visualViewport resize (keyboard), but WITHOUT lifting the sheet.
    // This just helps scroll the focused input into view once the viewport changes.
    const vv = window.visualViewport;
    const onVV = () => {
      const active = document.activeElement as Element | null;
      if (active && isTextInputEl(active)) {
        scrollFocusedIntoView(active);
      }
    };
    if (vv) {
      vv.addEventListener("resize", onVV);
      vv.addEventListener("scroll", onVV);
    }

    return () => {
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      if (vv) {
        vv.removeEventListener("resize", onVV);
        vv.removeEventListener("scroll", onVV);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (v < -0.7) return snapTo("FULL");
    if (v > 0.7) return snapTo("HALF");

    const dHalf = Math.abs(h - HALF);
    const dFull = Math.abs(h - FULL);
    snapTo(dFull <= dHalf ? "FULL" : "HALF");
  };

  const onPointerDownHandle = (e: React.PointerEvent) => {
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
            bottom: 0, // keyboard overlays sheet (no lift)
            zIndex: 1300,
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
              touchAction: "none",
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
                <IconButton
                  onClick={() => setOpen(false)}
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

          {/* Content area (scroll container) */}
          <Box
            ref={contentRef}
            sx={{
              flex: 1,
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              px: 1.15,
              py: 1.15,
              pb: `calc(${BOTTOM_TAB_GUARD_PX}px + env(safe-area-inset-bottom) + 16px)`,
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
