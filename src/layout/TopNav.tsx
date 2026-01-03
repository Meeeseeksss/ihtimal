import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Switch,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { mockMarkets } from "../data/mockMarkets";
import Logo from "../assets/ihtimal-logo.svg";
import { HowItWorksModal } from "../components/HowItWorksModal";
import { useColorMode } from "../theme/ColorModeContext";

const RECENTS_KEY = "recentMarketSearches";
const MAX_RECENTS = 7;

/* ---------- helpers ---------- */

type SearchItem =
  | { type: "market"; id: string; label: string; sublabel?: string }
  | { type: "recent"; q: string; label: string }
  | { type: "search"; q: string; label: string };

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => typeof x === "string").slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function writeRecents(recents: string[]) {
  try {
    localStorage.setItem(
      RECENTS_KEY,
      JSON.stringify(recents.slice(0, MAX_RECENTS))
    );
  } catch {}
}

/* ---------- component ---------- */

export function TopNav({
  collapsed,
  isMobile,
  onMenuClick,
}: {
  collapsed: boolean;
  isMobile: boolean;
  onMenuClick: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();

  const navPx = { xs: 1.5, sm: 2.5 };
  const searchHeight = 40;
  const searchRadius = 999;
  const logoHeight = 22;
  const leftGap = 1.25;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [acctAnchorEl, setAcctAnchorEl] = useState<null | HTMLElement>(null);
  const [recents, setRecents] = useState<string[]>(() => readRecents());
  const [highlightIndex, setHighlightIndex] = useState(0);

  const acctOpen = Boolean(acctAnchorEl);

  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRecents(readRecents());
  }, []);

  useEffect(() => {
    setOpen(false);
    setAcctAnchorEl(null);
  }, [location.pathname, location.search]);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];

    return mockMarkets
      .filter((m) => m.question.toLowerCase().includes(needle))
      .slice(0, 7)
      .map<SearchItem>((m) => ({
        type: "market",
        id: m.id,
        label: m.question,
        sublabel: `${m.category} • YES ${Math.round(m.yesPrice * 100)}%`,
      }));
  }, [q]);

  const selectable = useMemo(() => {
    if (!q.trim()) {
      return recents.map((r) => ({ type: "recent", q: r, label: r }));
    }
    return [
      ...matches,
      { type: "search", q, label: `Search markets for "${q}"` },
    ];
  }, [q, matches, recents]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          width: "100%",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 56,
            px: navPx,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            {/* LEFT: desktop hamburger + logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: leftGap,
                flex: "0 0 auto",
              }}
            >
              {/* DESKTOP ONLY */}
              <IconButton
                onClick={onMenuClick}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  border: "1px solid",
                  borderColor: "divider",
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                }}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <MenuIcon />
              </IconButton>

              <Box
                component={RouterLink}
                to="/markets"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: logoHeight,
                  "& img": { height: "100%" },
                }}
              >
                <img src={Logo} alt="Ihtimal" />
              </Box>
            </Box>

            {/* CENTER: search */}
            <Box ref={anchorRef} sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search markets"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: {
                    height: searchHeight,
                    borderRadius: searchRadius,
                    bgcolor: "rgba(17,24,39,0.04)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  },
                }}
              />
            </Box>

            {/* RIGHT: mobile account + how it works + desktop auth */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* MOBILE account */}
              <IconButton
                onClick={(e) => setAcctAnchorEl(e.currentTarget)}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  border: "1px solid",
                  borderColor: "divider",
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                }}
              >
                <AccountCircleOutlinedIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={acctAnchorEl}
                open={acctOpen}
                onClose={() => setAcctAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  <ListItemIcon>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => navigate("/login")}>
                  <ListItemIcon>
                    <LoginIcon fontSize="small" />
                  </ListItemIcon>
                  Log in
                </MenuItem>

                <MenuItem onClick={() => navigate("/signup")}>
                  <ListItemIcon>
                    <PersonAddAltIcon fontSize="small" />
                  </ListItemIcon>
                  Sign up
                </MenuItem>

                <Divider />

                <MenuItem onClick={toggleColorMode}>
                  <ListItemIcon>
                    {mode === "dark" ? (
                      <DarkModeOutlinedIcon fontSize="small" />
                    ) : (
                      <LightModeOutlinedIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  Dark mode
                  <Switch checked={mode === "dark"} sx={{ ml: "auto" }} />
                </MenuItem>
              </Menu>

              {/* HOW IT WORKS */}
              <IconButton
                onClick={() => setHowOpen(true)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>

              {!isMobile && (
                <>
                  <Button component={RouterLink} to="/login">Log in</Button>
                  <Button component={RouterLink} to="/signup" variant="contained">
                    Sign up
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </>
  );
}
