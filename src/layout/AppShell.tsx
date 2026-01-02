import { Box, Toolbar, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { MobileBottomNav } from "./MobileBottomNav";
import { useNotify } from "../app/notifications";
import { mockMarkets } from "../data/mockMarkets";
import { useWatchlist } from "../data/watchlist";
import { evaluateMarketAlerts, useMarketAlerts } from "../data/alerts";

const drawerWidth = 240;
const collapsedWidth = 72;

export function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const notify = useNotify();
  const { ids: watchedIds } = useWatchlist();
  const { cfg: alertCfg } = useMarketAlerts();

  const watchedMarkets = useMemo(() => {
    if (!watchedIds.length) return [];
    const set = new Set(watchedIds);
    return mockMarkets.filter((m) => set.has(m.id));
  }, [watchedIds]);

  // Desktop: allow collapsing the permanent sidebar.
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: temporary drawer toggle.
  const [mobileOpen, setMobileOpen] = useState(false);

  const sideWidth = collapsed ? collapsedWidth : drawerWidth;

  // P2: lightweight in-app alert engine (only while app is open).
  useEffect(() => {
    if (!watchedMarkets.length) return;
    if (!Object.keys(alertCfg).length) return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      for (const m of watchedMarkets) {
        const cfg = alertCfg[m.id];
        if (!cfg) continue;

        const hits = evaluateMarketAlerts({
          marketId: m.id,
          question: m.question,
          yesPrice: m.yesPrice,
          // ✅ mockMarkets.resolvesAt is ISO string → convert to ms number
          resolvesAt: Date.parse(m.resolvesAt),
          status: m.status,
          cfg,
          now,
          cooldownMs: 1000 * 60 * 60,
        });

        for (const h of hits) {
          notify({ severity: "info", message: h.message });
        }
      }
    }, 30_000);

    return () => window.clearTimeout(interval);
  }, [alertCfg, notify, watchedMarkets]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        width: "100%",
        
      }}
    >
      <TopNav
        collapsed={collapsed}
        isMobile={isMobile}
        onMenuClick={() => {
          if (isMobile) {
            setMobileOpen((v) => !v);
          } else {
            setCollapsed((v) => !v);
          }
        }}
      />

      <Box sx={{ display: "flex", width: "100%" }}>
        <SideNav
          width={sideWidth}
          collapsed={collapsed}
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          isMobile={isMobile}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            minWidth: 0,
            px: { xs: 1.5, sm: 2.5 },
            pb: { xs: 10, md: 4 },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>

      {isMobile ? <MobileBottomNav /> : null}
    </Box>
  );
}
