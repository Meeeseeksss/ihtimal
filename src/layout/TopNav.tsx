import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { mockMarkets } from "../data/mockMarkets";
import Logo from "../assets/ihtimal-logo.svg";

const RECENTS_KEY = "recentMarketSearches";
const MAX_RECENTS = 7;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string").slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function writeRecents(values: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(values.slice(0, MAX_RECENTS)));
  } catch {
    // ignore
  }
}

function pushRecent(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const current = readRecents();
  const next = [trimmed, ...current.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())];
  writeRecents(next);
}

export function TopNav({
  collapsed,
  isMobile,
  onMenuClick,
}: {
  collapsed: boolean;
  isMobile: boolean;
  onMenuClick: () => void;
}) {
  /**
   * 🎛️ DESIGN CONTROLS
   */
  const navPx = { xs: 2, sm: 2, md: 2 };
  const logoHeight = 26;
  const leftGap = 1.25;

  const searchMaxWidth = 900;
  const searchPreferred = { xs: "auto", sm: 360, md: 410 };

  const navigate = useNavigate();
  const location = useLocation();

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [recents, setRecents] = useState<string[]>([]);

  // load recents on mount
  useEffect(() => {
    setRecents(readRecents());
  }, []);

  // Keep the TopNav search box in sync when the user navigates to /markets?q=...
  useEffect(() => {
    if (!location.pathname.startsWith("/markets")) return;
    const sp = new URLSearchParams(location.search);
    const q = sp.get("q") ?? "";
    setSearchValue(q);
    setOpen(false);
    setHighlightIndex(-1);
  }, [location.pathname, location.search]);

  // Close autosuggest when clicking outside the search area
  useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const el = anchorRef.current;
      if (!el) return;
      if (ev.target instanceof Node && el.contains(ev.target)) return;
      setOpen(false);
      setHighlightIndex(-1);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const marketSuggestions = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [] as typeof mockMarkets;

    // Simple relevance: contains query, then sort by volume as a proxy for popularity.
    return mockMarkets
      .filter((m) => m.question.toLowerCase().includes(q))
      .sort((a, b) => b.volumeUsd - a.volumeUsd)
      .slice(0, 7);
  }, [searchValue]);

  const recentSuggestions = useMemo(() => {
    const q = searchValue.trim();
    if (q) return [];
    return recents.slice(0, MAX_RECENTS);
  }, [searchValue, recents]);

  const hasDropdownContent = marketSuggestions.length > 0 || recentSuggestions.length > 0;

  // Flatten "selectable items" for keyboard nav
  const selectable = useMemo(() => {
    type Item =
      | { type: "market"; id: string; label: string }
      | { type: "recent"; q: string; label: string }
      | { type: "search"; q: string; label: string };

    const items: Item[] = [];

    if (searchValue.trim()) {
      marketSuggestions.forEach((m) =>
        items.push({ type: "market", id: m.id, label: m.question })
      );
      // "Search for ..." action
      items.push({
        type: "search",
        q: searchValue.trim(),
        label: `Search for “${searchValue.trim()}”`,
      });
    } else {
      recentSuggestions.forEach((q) =>
        items.push({ type: "recent", q, label: q })
      );
    }

    return items;
  }, [marketSuggestions, recentSuggestions, searchValue]);

  function goToSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setRecents(readRecents());
    navigate(`/markets?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    setHighlightIndex(-1);
  }

  function goToMarket(id: string) {
    // (Optional) store query as recent if user had typed something
    if (searchValue.trim()) {
      pushRecent(searchValue.trim());
      setRecents(readRecents());
    }
    navigate(`/markets/${encodeURIComponent(id)}`);
    setOpen(false);
    setHighlightIndex(-1);
  }

  // function openIfPossible() {
  //   if (!hasDropdownContent) return;
  //   setOpen(true);
  // }

  function closeDropdown() {
    setOpen(false);
    setHighlightIndex(-1);
  }

  function moveHighlight(delta: number) {
    if (selectable.length === 0) return;
    setOpen(true);

    setHighlightIndex((prev) => {
      const start = prev < 0 ? (delta > 0 ? 0 : selectable.length - 1) : prev;
      const next = (start + delta + selectable.length) % selectable.length;
      return next;
    });
  }

  function activateHighlighted() {
    if (highlightIndex < 0 || highlightIndex >= selectable.length) {
      // If nothing highlighted, behave like "search"
      if (searchValue.trim()) goToSearch(searchValue);
      return;
    }

    const item = selectable[highlightIndex];
    if (item.type === "market") goToMarket(item.id);
    if (item.type === "recent") goToSearch(item.q);
    if (item.type === "search") goToSearch(item.q);
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 1,
        left: 0,
        right: 0,
        width: "100vw",
        maxWidth: "100vw",
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
            <IconButton
              onClick={onMenuClick}
              aria-label={
                isMobile
                  ? "Toggle menu"
                  : collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <MenuIcon />
            </IconButton>

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
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              maxWidth: searchMaxWidth,
              width: searchPreferred,
            }}
            ref={anchorRef}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search markets"
              value={searchValue}
              onChange={(e) => {
                const v = e.target.value;
                setSearchValue(v);
                setHighlightIndex(-1);
                setOpen(Boolean(v.trim()) && marketSuggestions.length > 0);
                if (!v.trim()) setOpen(true); // show recents when empty
              }}
              onFocus={() => {
                setRecents(readRecents());
                if (searchValue.trim()) {
                  setOpen(marketSuggestions.length > 0);
                } else {
                  setOpen(true); // show recents
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveHighlight(1);
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveHighlight(-1);
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  activateHighlighted();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  closeDropdown();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Popper
              open={open && hasDropdownContent}
              anchorEl={anchorRef.current}
              placement="bottom-start"
              sx={{ zIndex: (t) => t.zIndex.modal + 1, width: "100%" }}
            >
              <Paper
                elevation={6}
                sx={{
                  mt: 0.75,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <List dense disablePadding>
                  {/* Recents mode (empty query) */}
                  {!searchValue.trim() && recentSuggestions.length > 0 && (
                    <>
                      <Box sx={{ px: 1.5, py: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Recent searches
                        </Typography>
                      </Box>

                      {recentSuggestions.map((q, idx) => {
                        const itemIndex = idx; // in recents mode, recents are first
                        const selected = highlightIndex === itemIndex;
                        return (
                          <ListItemButton
                            key={`recent-${q}`}
                            selected={selected}
                            onMouseEnter={() => setHighlightIndex(itemIndex)}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => goToSearch(q)}
                          >
                            <ListItemText primary={q} />
                          </ListItemButton>
                        );
                      })}
                    </>
                  )}

                  {/* Market suggestions mode (typed query) */}
                  {searchValue.trim() && marketSuggestions.length > 0 && (
                    <>
                      {marketSuggestions.map((m, idx) => {
                        const itemIndex = idx; // market items first
                        const selected = highlightIndex === itemIndex;
                        return (
                          <ListItemButton
                            key={m.id}
                            selected={selected}
                            onMouseEnter={() => setHighlightIndex(itemIndex)}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => goToMarket(m.id)}
                          >
                            <ListItemText
                              primary={m.question}
                              secondary={
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {m.category} · ${m.volumeUsd.toLocaleString()} vol
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        );
                      })}

                      {/* "Search for ..." action is last selectable */}
                      {(() => {
                        const itemIndex = marketSuggestions.length;
                        const selected = highlightIndex === itemIndex;
                        return (
                          <ListItemButton
                            selected={selected}
                            onMouseEnter={() => setHighlightIndex(itemIndex)}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => goToSearch(searchValue)}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body2">
                                  Search for “{searchValue.trim()}”
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        );
                      })()}
                    </>
                  )}
                </List>
              </Paper>
            </Popper>
          </Box>

          {/* RIGHT: auth buttons (desktop/tablet ONLY) */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: "0 0 auto",
              }}
            >
              <Button component={RouterLink} to="/login" variant="text">
                Log in
              </Button>

              <Button component={RouterLink} to="/signup" variant="contained">
                Sign up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
