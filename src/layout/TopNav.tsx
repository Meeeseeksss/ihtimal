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
import { useEffect, useState } from "react";

import Logo from "../assets/ihtimal-logo.svg";
import { HowItWorksModal } from "../components/HowItWorksModal";
import { useColorMode } from "../theme/ColorModeContext";

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

  // Locked design constraints (source of truth)
  const navPx = { xs: 1.5, sm: 2.5 };
  const searchHeight = 40;
  const searchRadius = 999;
  const logoHeight = 22;
  const leftGap = 1.25;

  const [q, setQ] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [acctAnchorEl, setAcctAnchorEl] = useState<null | HTMLElement>(null);

  const acctOpen = Boolean(acctAnchorEl);

  function closeAcctMenu() {
    setAcctAnchorEl(null);
  }

  useEffect(() => {
    closeAcctMenu();
  }, [location.pathname, location.search]);

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
            {/* LEFT: desktop hamburger + logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: leftGap,
                flex: "0 0 auto",
              }}
            >
              {/* DESKTOP ONLY: hamburger */}
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
                aria-label="Go to markets"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: logoHeight,
                  textDecoration: "none",
                  "& img": { height: "100%", width: "auto" },
                }}
              >
                <img src={Logo} alt="Ihtimal" />
              </Box>
            </Box>

            {/* CENTER: search */}
            <Box
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
              </Box>
            </Box>

            {/* RIGHT: mobile account + how-it-works + desktop CTAs */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              {/* MOBILE ONLY: account icon (left of how-it-works icon) */}
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
                aria-label="Account"
                aria-controls={acctOpen ? "mobile-account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={acctOpen ? "true" : undefined}
              >
                <AccountCircleOutlinedIcon fontSize="small" />
              </IconButton>

              <Menu
                id="mobile-account-menu"
                anchorEl={acctAnchorEl}
                open={acctOpen}
                onClose={closeAcctMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    minWidth: 230,
                    overflow: "hidden",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    closeAcctMenu();
                    navigate("/profile");
                  }}
                >
                  <ListItemIcon>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    closeAcctMenu();
                    navigate("/login");
                  }}
                >
                  <ListItemIcon>
                    <LoginIcon fontSize="small" />
                  </ListItemIcon>
                  Log in
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    closeAcctMenu();
                    navigate("/signup");
                  }}
                >
                  <ListItemIcon>
                    <PersonAddAltIcon fontSize="small" />
                  </ListItemIcon>
                  Sign up
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    toggleColorMode();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {mode === "dark" ? (
                        <DarkModeOutlinedIcon fontSize="small" />
                      ) : (
                        <LightModeOutlinedIcon fontSize="small" />
                      )}
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Dark mode
                    </Typography>
                  </Box>

                  <Switch
                    edge="end"
                    checked={mode === "dark"}
                    onChange={() => toggleColorMode()}
                    onClick={(e) => e.stopPropagation()}
                    inputProps={{ "aria-label": "Toggle dark mode" }}
                  />
                </MenuItem>
              </Menu>

              {/* Desktop: How it works text link */}
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

              {/* Mobile: how-it-works icon */}
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

              {/* Desktop auth stays as-is */}
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
