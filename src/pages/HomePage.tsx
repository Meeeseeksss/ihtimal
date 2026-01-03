import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link as RouterLink } from "react-router-dom";
import { MarketCard } from "../components/MarketCard";
import { mockMarkets } from "../data/mockMarkets";

function Section({
  title,
  subtitle,
  to,
  children,
}: {
  title: string;
  subtitle?: string;
  to?: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: { xs: 1.75, sm: 2.25 },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {to ? (
            <Button
              component={RouterLink}
              to={to}
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                borderRadius: 999,
                height: 38,
                px: 2,
                fontWeight: 900,
                alignSelf: { xs: "stretch", sm: "auto" },
              }}
            >
              See all
            </Button>
          ) : null}
        </Stack>

        {children}
      </Stack>
    </Paper>
  );
}

export function HomePage() {
  const byVolume = [...mockMarkets].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 6);
  const closeCalls = [...mockMarkets]
    .sort((a, b) => Math.abs(a.yesPrice - 0.5) - Math.abs(b.yesPrice - 0.5))
    .slice(0, 6);
  const longShots = [...mockMarkets].sort((a, b) => a.yesPrice - b.yesPrice).slice(0, 6);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 4 }}>
      <Stack spacing={2.25}>
        {/* Hero */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: { xs: 2, sm: 2.5 },
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(600px circle at 20% 10%, rgba(0,122,255,0.18), transparent 55%), radial-gradient(700px circle at 90% 30%, rgba(52,199,89,0.14), transparent 55%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            spacing={{ xs: 1.75, md: 2.5 }}
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ position: "relative" }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -0.4 }}>
                Discover today’s top markets
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, maxWidth: 620, lineHeight: 1.5 }}
              >
                Explore what’s moving, what’s close, and what’s mispriced — then trade in seconds.
              </Typography>
            </Box>

            {/* Placeholder hero image (swap later for real art/photo) */}
            <Box
              aria-hidden
              sx={{
                width: { xs: "100%", md: 360 },
                height: { xs: 160, sm: 180, md: 190 },
                flex: "0 0 auto",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(17,24,39,0.04)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(0,122,255,0.14), rgba(52,199,89,0.10), rgba(255,149,0,0.10))",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: "relative",
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "text.secondary",
                  bgcolor: "rgba(255,255,255,0.55)",
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(6px)",
                }}
              >
                Placeholder image
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Divider />

        <Section title="Trending" subtitle="Highest volume markets right now." to="/markets">
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            {byVolume.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </Box>
        </Section>

        <Section title="Close calls" subtitle="Markets near 50/50 — usually volatile." to="/markets">
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            {closeCalls.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </Box>
        </Section>

        <Section
          title="Long shots"
          subtitle="Low probability outcomes — high conviction trades."
          to="/markets"
        >
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            {longShots.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </Box>
        </Section>
      </Stack>
    </Box>
  );
}
