import { alpha, createTheme } from "@mui/material/styles";

export type AppColorMode = "light" | "dark";

export function getAppTheme(mode: AppColorMode) {
  const isDark = mode === "dark";

  // Apple-ish light/dark ramps (calm + premium)
  const bgDefault = isDark ? "#0B0B0D" : "#F5F5F7";
  const bgPaper = isDark ? "#121216" : "#FFFFFF";

  const textPrimary = isDark ? "#F5F5F7" : "#1D1D1F";
  const textSecondary = isDark ? alpha("#F5F5F7", 0.7) : "#6E6E73";
  const textDisabled = isDark ? alpha("#F5F5F7", 0.45) : "#9E9EA3";

  const divider = isDark ? alpha("#FFFFFF", 0.12) : alpha("#000000", 0.08);

  return createTheme({
    palette: {
      mode,

      primary: {
        main: "#007AFF",
      },
      success: {
        main: "#34C759",
      },
      error: {
        main: "#FF3B30",
      },
      warning: {
        main: "#FF9500",
      },

      background: {
        default: bgDefault,
        paper: bgPaper,
      },

      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: textDisabled,
      },

      divider,
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",

      h5: {
        fontWeight: 700,
        letterSpacing: -0.25,
      },
      h6: {
        fontWeight: 650,
        letterSpacing: -0.2,
      },
      subtitle1: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },

    components: {
      // Surfaces: border > shadow, and border color adapts to mode
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          }),
        },
      },

      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          }),
        },
      },

      // Top app bar: translucent sheet that adapts
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            backgroundColor: isDark
              ? alpha(theme.palette.background.paper, 0.72)
              : "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
            backgroundClip: "padding-box",
          }),
        },
      },

      // Chips / tags
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 600,
            backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.07 : 0.04),
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },

      // Table header background + border adapt
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            color: theme.palette.text.secondary,
            fontWeight: 700,
            backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.03),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },

      // Inputs: calm pill background that adapts
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
            borderRadius: 12,
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },

      // Buttons: keep flat
      MuiButton: {
        styleOverrides: {
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },

      // Toggle buttons: colors adapt
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            fontWeight: 600,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            "&.Mui-selected": {
              backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.06),
            },
          }),
        },
      },
    },
  });
}
