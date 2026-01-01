import { Box, Toolbar, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;
const collapsedWidth = 72;

export function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Desktop: allow collapsing the permanent sidebar.
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: temporary drawer toggle.
  const [mobileOpen, setMobileOpen] = useState(false);

  const sideWidth = collapsed ? collapsedWidth : drawerWidth;

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
            // ✅ Toggle open/close on mobile
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
            pb: 4,
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
