import { Box, Tab, Tabs } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

type NavTab = { label: string; to: string };

const TABS: NavTab[] = [
  { label: "All", to: "/markets" },
  { label: "Politics", to: "/categories/POLITICS" },
  { label: "Crypto", to: "/categories/CRYPTO" },
  { label: "Sports", to: "/categories/SPORTS" },
  { label: "Collections", to: "/collections" },
];

export function SecondaryNav() {
  const location = useLocation();

  const tab = (() => {
    const p = location.pathname;
    const idx = TABS.findIndex((t) => p === t.to || p.startsWith(t.to + "/"));
    if (idx !== -1) return idx;
    // Treat / as markets
    if (p === "/") return 0;
    return 0;
  })();

  return (
    <Box
      sx={{
        position: "sticky",
        // below the fixed TopNav (56px)
        top: { xs: 56, sm: 56 },
        zIndex: 10,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Tabs value={tab} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ px: 2 }}>
        {TABS.map((t) => (
          <Tab key={t.to} label={t.label} component={RouterLink} to={t.to} />
        ))}
      </Tabs>
    </Box>
  );
}
