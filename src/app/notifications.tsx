import { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

export type SnackSeverity = "success" | "info" | "warning" | "error";

export type Snack = {
  message: string;
  severity?: SnackSeverity;
};

type SnackbarContextType = {
  notify: (snack: Snack) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<Snack | null>(null);

  const notify = (s: Snack) => {
    setSnack(s);
  };

  const handleClose = () => {
    setSnack(null);
  };

  return (
    <SnackbarContext.Provider value={{ notify }}>
      {children}

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack?.severity ?? "info"}
          variant="filled"
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {snack?.message ?? ""}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useNotify(): (snack: Snack) => void {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useNotify must be used within SnackbarProvider");
  }
  return ctx.notify;
}
