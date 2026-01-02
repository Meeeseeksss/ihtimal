import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",

    /**
     * Apple system blue
     */
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

    /**
     * 🍎 APPLE-LIKE BACKGROUNDS (KEY PART)
     */
    background: {
      // Main app canvas (macOS window background)
      default: "#F5F5F7",

      // Cards, sheets, navbars
      paper: "#FFFFFF",
    },

    /**
     * Apple grayscale ramp
     */
    text: {
      primary: "#1D1D1F",
      secondary: "#6E6E73",
      disabled: "#9E9EA3",
    },

    /**
     * Ultra-light separators (Apple uses borders, not shadows)
     */
    divider: "rgba(0, 0, 0, 0.08)",
  },

  /**
   * Softer corners, not bubbly
   */
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
    /**
     * 🍎 APPLE SURFACES
     * Border > shadow
     */
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "none",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "none",
        },
      },
    },

    /**
     * AppBar should feel like a sheet, not a banner
     */
MuiAppBar: {
  styleOverrides: {
    root: {
      backgroundImage: "none",

      /**
       * 🍎 Apple-style translucent sheet
       */
      backgroundColor: "rgba(255, 255, 255, 0.72)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",

      /**
       * Subtle separation (Apple uses borders, not shadows)
       */
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "none",

      /**
       * Prevent color bleed from parent backgrounds
       */
      backgroundClip: "padding-box",
    },
  },
},


    /**
     * Chips = iOS tags
     */
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          backgroundColor: "rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },

    /**
     * Tables: very quiet headers
     */
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#6E6E73",
          fontWeight: 700,
          backgroundColor: "#FAFAFA",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },

    /**
     * Inputs (important for Apple feel)
     */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.04)",
          borderRadius: 12,
        },
        notchedOutline: {
          borderColor: "rgba(0,0,0,0.08)",
        },
      },
    },

    /**
     * Buttons: flat, calm
     */
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

    /**
     * Toggle buttons
     */
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          color: "#1D1D1F",
          borderColor: "rgba(0,0,0,0.08)",
          "&.Mui-selected": {
            backgroundColor: "rgba(0,0,0,0.06)",
          },
        },
      },
    },
  },
});
