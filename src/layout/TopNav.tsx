import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Link,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";

import { mockMarkets } from "../data/mockMarkets";
import Logo from "../assets/ihtimal-logo.svg";
import { HowItWorksModal } from "../components/HowItWorksModal";

const RECENTS_KEY = "recentMarketSearches";
const MAX_RECENTS = 7;

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
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
  } catch {
    // ignore
  }
}

export function TopNav({
  collapsed,
  isMobile,
  onMenuClick,
}: {
  collapsed: boolean;
  isMobile: boolean; // used for other layout choices (auth buttons etc.)
  onMenuClick: () => void;
}) {
  const theme = useTheme();

  // ✅ Only hide hamburger on true phone widths
  const hideMenuOnPhone = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();

  // Locked design constraints (source of truth per user)
  const navPx = { xs: 1.5, sm: 2.5 };
  const searchHeight = 40;
  const searchRadius = 999;
  const logoHeight = 22;
  const leftGap = 1.25;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => readRecents());
  const [highlightIndex, setHighlightIndex] = useState(0);

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setRecents(readRecents());
  }, []);

  // If the user navigates, close the popper.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];

    // Very lightweight “autosuggest” from mockMarkets (no backend)
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
    const needle = q.trim();

    const out: SearchItem[] = [];
    if (!needle) {
      // Recents when empty.
      for (const r of recents.slice(0, MAX_RECENTS)) {
        out.push({ type: "recent", q: r, label: r });
      }
      return out;
    }

    out.push(...matches);
    out.push({ type: "search", q: needle, label: `Search markets for "${needle}"` });

    return out;
  }, [q, recents, matches]);

  function addRecent(next: string) {
    const trimmed = next.trim();
    if (!trimmed) return;

    const merged = [trimmed, ...recents.filter((r) => r !== trimmed)].slice(0, MAX_RECENTS);
    setRecents(merged);
    writeRecents(merged);
  }

  function goToSearch(query: string) {
    addRecent(query);
    setOpen(false);
    navigate(`/markets?q=${encodeURIComponent(query)}`);
  }

  function goToMarket(marketId: string) {
    setOpen(false);
    navigate(`/markets/${marketId}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(selectable.length - 1, i + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = selectable[highlightIndex];
      if (!item) return;

      if (item.type === "market") goToMarket(item.id);
      if (item.type === "recent") goToSearch(item.q);
      if (item.type === "search") goToSearch(item.q);
    }
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          // Avoid 100vw (can cause horizontal overflow due to scrollbar width).
          width: "100%",
          left: 0,
          right: 0,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 56,
            width: "100%",
            px: navPx,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              gap: 1.25,
            }}
          >
            {/* LEFT: menu + logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: leftGap,
                flex: "0 0 auto",
              }}
            >
              {/* ✅ Hide hamburger ONLY on phone */}
              {!hideMenuOnPhone ? (
                <IconButton
                  onClick={onMenuClick}
                  sx={{
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
              ) : null}

              <Box
                component={RouterLink}
                to="/markets"
                aria-label="Go to markets"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: logoHeight,
                  textDecoration: "none",
                  "& img": {
                    height: "100%",
                    width: "auto",
                  },
                }}
              >
                <img src={Logo} alt="Ihtimal" />
              </Box>
            </Box>

            {/* CENTER: search */}
            <Box
              ref={anchorRef}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: 520, md: 620, lg: 680 },
                  maxWidth: "100%",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search markets"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setHighlightIndex(0);
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setOpen(false), 120);
                  }}
                  onKeyDown={onKeyDown}
                  inputRef={inputRef}
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
                      border: "1px solid rgba(17,24,39,0.14)",
                      "&:hover": {
                        bgcolor: "rgba(17,24,39,0.06)",
                        borderColor: "rgba(17,24,39,0.22)",
                      },
                      "&.Mui-focused": {
                        bgcolor: "rgba(17,24,39,0.06)",
                        borderColor: "rgba(17,24,39,0.32)",
                      },
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />

                <Popper
                  open={open && selectable.length > 0}
                  anchorEl={anchorRef.current}
                  placement="bottom-start"
                  sx={{ zIndex: 1400, width: "100%", mt: 1 }}
                >
                  <Paper
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <List dense disablePadding>
                      {selectable.map((item, idx) => {
                        const selected = idx === highlightIndex;
                        const primary = item.label;
                        const secondary =
                          item.type === "market" ? item.sublabel : item.type === "recent" ? "Recent search" : "";

                        return (
                          <ListItemButton
                            key={`${item.type}-${item.type === "market" ? item.id : item.q}-${idx}`}
                            selected={selected}
                            onMouseEnter={() => setHighlightIndex(idx)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (item.type === "market") goToMarket(item.id);
                              if (item.type === "recent") goToSearch(item.q);
                              if (item.type === "search") goToSearch(item.q);
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {primary}
                                </Typography>
                              }
                              secondary={
                                secondary ? (
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {secondary}
                                  </Typography>
                                ) : null
                              }
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </Box>

            {/* RIGHT: how it works + auth CTAs */}
            <Box sx={{ display: "flex", gap: 1, flex: "0 0 auto", alignItems: "center" }}>
              {/* Polymarket-like "How it works" */}
              <Link
                component="button"
                onClick={() => setHowOpen(true)}
                underline="none"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  alignItems: "center",
                  gap: 0.75,
                  fontWeight: 600,
                  color: "primary.main",
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  "&:hover": { bgcolor: "rgba(25,118,210,0.08)" },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                How it works
              </Link>

              {/* Compact icon on smaller screens */}
              <IconButton
                onClick={() => setHowOpen(true)}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  border: "1px solid",
                  borderColor: "divider",
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                }}
                aria-label="How it works"
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>

              {!isMobile && (
                <>
                  <Button component={RouterLink} to="/login" variant="text">
                    Log in
                  </Button>

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
