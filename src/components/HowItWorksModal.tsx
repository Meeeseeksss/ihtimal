import { Box, Button, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Step = {
  title: string;
  body: string;
  /** Optional tiny eyebrow above title (e.g. "1.") */
  eyebrow?: string;
  /** If true, show auth prompt instead of Next */
  isAuthStep?: boolean;
};

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = useMemo(
    () => [
      {
        eyebrow: "1.",
        title: "Pick a market",
        body:
          "Choose an outcome and buy shares if you think it will happen. Prices move in real time as the crowd trades.",
      },
      {
        eyebrow: "2.",
        title: "Place a trade",
        body:
          "Enter an amount, confirm your order, and you’re in. You can buy or sell any time while the market is live.",
      },
      {
        eyebrow: "3.",
        title: "Profit (or cut risk)",
        body:
          "Sell shares to lock in gains (or reduce risk). If you hold to resolution, winning shares settle at $1 each.",
      },
      {
        title: "Welcome to IHTIMAL",
        body: "Create an account to start trading outcomes in minutes.",
        isAuthStep: true,
      },
    ],
    []
  );

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const isDark = theme.palette.mode === "dark";
  const panelBg = isDark ? alpha("#0b1220", 0.92) : alpha("#0b1220", 0.92);
  const panelStroke = isDark ? alpha("#fff", 0.1) : alpha("#fff", 0.1);
  const muted = alpha("#fff", 0.72);

  function closeAndReset() {
    onClose();
    // Reset after close animation so next open starts on step 1.
    window.setTimeout(() => setStepIndex(0), 180);
  }

  return (
    <Dialog
      open={open}
      onClose={closeAndReset}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${panelStroke}`,
          bgcolor: panelBg,
          boxShadow: "0 24px 90px rgba(0,0,0,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: "relative", p: { xs: 2.25, sm: 3 } }}>
          <IconButton
            onClick={closeAndReset}
            aria-label="Close"
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
              color: alpha("#fff", 0.75),
              bgcolor: alpha("#fff", 0.06),
              border: `1px solid ${alpha("#fff", 0.1)}`,
              "&:hover": { bgcolor: alpha("#fff", 0.1) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Illustration placeholder (swap for real images later) */}
          <Box
            sx={{
              height: { xs: 190, sm: 230 },
              borderRadius: 2.5,
              border: `1px solid ${alpha("#fff", 0.1)}`,
              bgcolor: alpha("#fff", 0.05),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.5,
              overflow: "hidden",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: alpha("#fff", 0.85), fontWeight: 900, fontSize: 14 }}>
                {step.isAuthStep ? "Get started" : `Step ${Math.min(stepIndex + 1, 3)}`}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.55) }}>
                (Illustration placeholder)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", px: { xs: 0.5, sm: 2 } }}>
            {step.eyebrow ? (
              <Typography sx={{ color: muted, fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}>
                {step.eyebrow}
              </Typography>
            ) : null}

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 950,
                fontSize: { xs: 26, sm: 30 },
                lineHeight: 1.08,
              }}
            >
              {step.title}
            </Typography>

            <Typography sx={{ mt: 1.25, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>
              {step.body}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            {step.isAuthStep ? (
              <Box sx={{ width: "100%", display: "grid", gap: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    closeAndReset();
                    navigate("/signup");
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.15,
                    fontWeight: 950,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
                >
                  Sign up
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    closeAndReset();
                    navigate("/login");
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.15,
                    fontWeight: 900,
                    textTransform: "none",
                    borderColor: alpha("#fff", 0.16),
                    color: alpha("#fff", 0.9),
                    "&:hover": {
                      borderColor: alpha("#fff", 0.24),
                      bgcolor: alpha("#fff", 0.06),
                    },
                  }}
                >
                  Log in
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  py: 1.15,
                  fontWeight: 950,
                  textTransform: "none",
                  boxShadow: "none",
                }}
              >
                Next
              </Button>
            )}
          </Box>

          {/* Progress dots (only for the 3 steps) */}
          {!step.isAuthStep ? (
            <Box sx={{ mt: 2.25, display: "flex", justifyContent: "center", gap: 0.75 }}>
              {[0, 1, 2].map((i) => {
                const active = i === stepIndex;
                return (
                  <Box
                    key={i}
                    sx={{
                      width: active ? 18 : 8,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: active ? alpha("#fff", 0.55) : alpha("#fff", 0.18),
                      transition: "all 140ms ease",
                    }}
                  />
                );
              })}
            </Box>
          ) : null}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
