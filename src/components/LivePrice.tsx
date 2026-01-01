import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export function LivePrice({ value }: { value: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value > prev.current) setFlash("up");
    if (value < prev.current) setFlash("down");

    prev.current = value;

    const t = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <Typography
      sx={{
        fontWeight: 800,
        px: 0.75,
        borderRadius: 1,
        transition: "background-color 0.4s",
        bgcolor:
          flash === "up"
            ? "rgba(74,222,128,0.25)"
            : flash === "down"
            ? "rgba(248,113,113,0.25)"
            : "transparent",
      }}
    >
      {Math.round(value * 100)}%
    </Typography>
  );
}
