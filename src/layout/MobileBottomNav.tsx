import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, type ReactNode } from "react";

type NavItem = {
  value: string;
  label: string;
  to: string;
  icon: ReactNode;
};

const ITEMS: NavItem[] = [
  { value: "markets", label: "Markets", to: "/markets", icon: <HomeRoundedIcon /> },
  { value: "watchlist", label: "Watch", to: "/watchlist", icon: <StarRoundedIcon /> },
  { value: "portfolio", label: "Portfolio", to: "/portfolio", icon: <PieChartRoundedIcon /> },
  { value: "wallet", label: "Wallet", to: "/wallet", icon: <AccountBalanceWalletRoundedIcon /> },
  { value: "activity", label: "Activity", to: "/activity", icon: <ReceiptLongRoundedIcon /> },
];

function pickValue(pathname: string): string {
  if (pathname.startsWith("/watchlist")) return "watchlist";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  if (pathname.startsWith("/wallet")) return "wallet";
  if (pathname.startsWith("/activity")) return "activity";
  // Market detail, categories, collections all map to discovery.
  return "markets";
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const value = useMemo(() => pickValue(location.pathname), [location.pathname]);

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1400,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, next) => {
          const item = ITEMS.find((i) => i.value === next);
          if (!item) return;
          navigate(item.to);
        }}
        showLabels
      >
        {ITEMS.map((i) => (
          <BottomNavigationAction key={i.value} value={i.value} label={i.label} icon={i.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
