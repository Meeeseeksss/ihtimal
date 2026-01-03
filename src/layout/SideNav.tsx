import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Toolbar,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { NavLink } from "react-router-dom";
import { useColorMode } from "../theme/ColorModeContext";

export function SideNav({
  width,
  collapsed,
  variant,
  open,
  onClose,
  isMobile,
}: {
  width: number;
  collapsed: boolean;
  variant: "permanent" | "temporary";
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const { mode, toggleColorMode } = useColorMode();
  const isTemporary = variant === "temporary";

  const navItems = [
    { label: "Markets", to: "/markets", icon: <StorefrontOutlinedIcon /> },
    { label: "Watchlist", to: "/watchlist", icon: <StarBorderRoundedIcon /> },
    { label: "Portfolio", to: "/portfolio", icon: <TimelineOutlinedIcon /> },
    { label: "Wallet", to: "/wallet", icon: <AccountBalanceWalletOutlinedIcon /> },
    { label: "Activity", to: "/activity", icon: <ReceiptLongOutlinedIcon /> },
    { label: "Profile", to: "/profile", icon: <PersonOutlinedIcon /> },
  ];

  const effectiveCollapsed = isTemporary ? false : collapsed;

  const authItems = [
    { label: "Log in", to: "/login", icon: <LoginOutlinedIcon /> },
    { label: "Sign up", to: "/signup", icon: <PersonAddAltOutlinedIcon /> },
  ];

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={isTemporary ? { keepMounted: true } : undefined}
      sx={{
        width: isTemporary ? undefined : width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isTemporary ? Math.min(300, width) : width,
          boxSizing: "border-box",
          borderRight: isTemporary ? "none" : "1px solid",
          borderColor: "divider",
          top: { xs: 0, sm: 0 },
          height: { xs: "100%", sm: "100%" },
          zIndex: 1,
        },
      }}
    >
      <Toolbar />

      <Box sx={{ px: effectiveCollapsed ? 0 : 1 }}>
        <List>
          {navItems.map((i) => {
            const btn = (
              <ListItemButton
                key={i.to}
                component={NavLink}
                to={i.to}
                onClick={isTemporary ? onClose : undefined}
                sx={{
                  borderRadius: 2,
                  my: 0.5,
                  justifyContent: effectiveCollapsed ? "center" : "flex-start",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: effectiveCollapsed ? 0 : 1.5,
                    justifyContent: "center",
                  }}
                >
                  {i.icon}
                </ListItemIcon>
                {!effectiveCollapsed && <ListItemText primary={i.label} />}
              </ListItemButton>
            );

            return effectiveCollapsed ? (
              <Tooltip title={i.label} placement="right" key={i.to}>
                {btn}
              </Tooltip>
            ) : (
              btn
            );
          })}
        </List>

        {/* Bottom actions */}
        <Divider sx={{ my: 1.5 }} />
        <List>
          {(() => {
            const label = mode === "dark" ? "Light mode" : "Dark mode";
            const icon =
              mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />;

            const btn = (
              <ListItemButton
                onClick={() => {
                  toggleColorMode();
                  if (isTemporary) onClose();
                }}
                sx={{
                  borderRadius: 2,
                  my: 0.5,
                  justifyContent: effectiveCollapsed ? "center" : "flex-start",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: effectiveCollapsed ? 0 : 1.5,
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {!effectiveCollapsed && <ListItemText primary={label} />}
              </ListItemButton>
            );

            return effectiveCollapsed ? (
              <Tooltip title={label} placement="right" key="theme-toggle">
                {btn}
              </Tooltip>
            ) : (
              <Box key="theme-toggle">{btn}</Box>
            );
          })()}
        </List>

        {isMobile && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <List>
              {authItems.map((i) => (
                <ListItemButton
                  key={i.to}
                  component={NavLink}
                  to={i.to}
                  onClick={onClose}
                  sx={{ borderRadius: 2, my: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: "center" }}>
                    {i.icon}
                  </ListItemIcon>
                  <ListItemText primary={i.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}
