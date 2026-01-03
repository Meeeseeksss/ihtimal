import {
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
  SvgIcon,
} from "@mui/material";
import type { SvgIconProps } from "@mui/material";
// import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
// import RedditIcon from "@mui/icons-material/Reddit";
import TelegramIcon from "@mui/icons-material/Telegram";
import IhtimalLogo from "../assets/ihtimal-logo.svg";
import { Link as RouterLink } from "react-router-dom";
import { useMemo, useState } from "react";

type FooterColumn = {
  title: string;
  links: Array<{ label: string; to?: string; href?: string }>;
};

const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Markets", to: "/" },
      { label: "Collections", to: "/collections" },
      { label: "Watchlist", to: "/watchlist" },
      { label: "Portfolio", to: "/portfolio" },
      { label: "Wallet", to: "/wallet" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Politics", to: "/category/politics" },
      { label: "Sports", to: "/category/sports" },
      { label: "Crypto", to: "/category/crypto" },
      { label: "World", to: "/category/world" },
      { label: "Trending", to: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "How it works", to: "/" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Fees", href: "#" },
      { label: "API", href: "#" },
      { label: "Status", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Risk Disclosure", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Disclosures", href: "#" },
    ],
  },
];

function FooterLink({ label, to, href }: { label: string; to?: string; href?: string }) {
  if (to) {
    return (
      <Link
        component={RouterLink}
        to={to}
        underline="hover"
        color="text.secondary"
        sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.9, width: "fit-content" }}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href ?? "#"}
      underline="hover"
      color="text.secondary"
      sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.9, width: "fit-content" }}
    >
      {label}
    </Link>
  );
}

/**
 * MUI does not ship official Discord/TikTok brand icons in @mui/icons-material.
 * Keep these two as custom SVG so you still get real logos.
 */
function DiscordBrandIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M20 5.2A16.9 16.9 0 0 0 15.9 4c-.2.4-.4.8-.6 1.2a15.8 15.8 0 0 0-6.6 0c-.2-.4-.4.8-.6-1.2A16.9 16.9 0 0 0 4 5.2C1.7 8.6 1.1 12 1.3 15.4c1.5 1.1 3.2 2 5 2.5.4-.5.7-1.1 1-1.7-.6-.2-1.1-.5-1.6-.8l.4-.3c3.1 1.4 8.1 1.4 11.2 0l.4.3c-.5.3-1 .6-1.6.8.3.6.6 1.2 1 1.7 1.8-.5 3.5-1.4 5-2.5.3-3.9-.5-7.2-2.3-10.2ZM8.7 14.3c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm6.6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z" />
    </SvgIcon>
  );
}

function TikTokBrandIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M15 3c.6 2.3 2.2 3.9 4.5 4.5V10a7.1 7.1 0 0 1-4.5-1.6V15a5 5 0 1 1-5-5h1v2.6a2.4 2.4 0 1 0 1.9 2.3V3H15Z" />
    </SvgIcon>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "" : "Enter a valid email";
  }, [email]);

  const statusText = useMemo(() => {
    if (emailError) return emailError;
    if (subscribed) return "Subscribed (UI only)";
    return "";
  }, [emailError, subscribed]);

  const socials = useMemo(
    () => [
      // X: MUI only has Twitter bird icon; use it as X for now.
      { label: "X", href: "#", icon: <TwitterIcon fontSize="small" /> },

    //   { label: "LinkedIn", href: "#", icon: <LinkedInIcon fontSize="small" /> },
      { label: "Discord", href: "#", icon: <DiscordBrandIcon fontSize="small" /> },
      { label: "Instagram", href: "#", icon: <InstagramIcon fontSize="small" /> },
    //   { label: "Reddit", href: "#", icon: <RedditIcon fontSize="small" /> },
    //   { label: "TikTok", href: "#", icon: <TikTokBrandIcon fontSize="small" /> },
      { label: "Telegram", href: "#", icon: <TelegramIcon fontSize="small" /> },
    //   { label: "GitHub", href: "#", icon: <GitHubIcon fontSize="small" /> },
    ],
    []
  );

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 4, md: 6 },
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 5 },
          width: "100%",
        }}
      >
        <Stack spacing={3.25}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2.25}
          >
            <Stack spacing={1}>
              <Box component="img" src={IhtimalLogo} alt="Ihtimal" sx={{ height: 28, width: "auto" }} />
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                Trade real-world outcomes with live probabilities — fast, clean, conviction-driven.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <FooterLink label="Login" to="/login" />
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                •
              </Typography>
              <FooterLink label="Sign up" to="/signup" />
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                •
              </Typography>
              <FooterLink label="Help" href="#" />
            </Stack>
          </Stack>

          {/* Connect row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.25}
            sx={{
            //   border: "1px solid",
            //   borderColor: "divider",
              borderRadius: 2,
              px: 2,
              py: 1.25,
            }}
          >
            <Typography variant="body2" fontWeight={900}>
              Connect
            </Typography>

            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              {socials.map((s) => (
                <IconButton
                  key={s.label}
                  aria-label={s.label}
                  size="small"
                  href={s.href}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>

          {/* Newsletter */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2.25 },
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={900}>
                  Get updates
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
                  New markets, featured collections, and product drops. No spam.
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="stretch"
                sx={{
                  width: { xs: "100%", md: 460 },
                  flexShrink: 0,
                }}
              >
                <TextField
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  size="small"
                  placeholder="you@domain.com"
                  error={Boolean(emailError)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": { borderRadius: 999, height: 40 },
                    "& input": { height: "40px", boxSizing: "border-box", py: 0 },
                  }}
                />

                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    if (!email.trim()) return;
                    if (emailError) return;
                    setSubscribed(true);
                  }}
                  sx={{
                    height: 40,
                    borderRadius: 999,
                    px: 2.25,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    alignSelf: "stretch",
                  }}
                >
                  Subscribe
                </Button>
              </Stack>
            </Stack>

            <Typography
              variant="caption"
              sx={{
                mt: 0.75,
                color: emailError ? "error.main" : "text.secondary",
                minHeight: 18,
              }}
            >
              {statusText || " "}
            </Typography>
          </Box>

          <Divider />

          {/* Link grid */}
          <Box
            sx={{
              display: "grid",
              gap: { xs: 3, md: 3.5 },
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(5, minmax(0, 1fr))",
              },
            }}
          >
            {columns.map((col) => (
              <Stack key={col.title} spacing={0.8} sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={900}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.7, fontSize: 12 }}
                >
                  {col.title}
                </Typography>

                <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                  {col.links.map((l) => (
                    <FooterLink key={`${col.title}-${l.label}`} {...l} />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Box>

          <Divider />

          {/* Bottom row */}
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Trading involves risk. Prices move. You can lose capital.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
            >
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} Ihtimal. All rights reserved.
              </Typography>

              <Stack direction="row" spacing={1.5}>
                <FooterLink label="Privacy" href="#" />
                <FooterLink label="Terms" href="#" />
                <FooterLink label="Risk" href="#" />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
