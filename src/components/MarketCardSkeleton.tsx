import { Card, CardContent, Skeleton, Box } from "@mui/material";

// Match MarketCard overall height so skeletons don't jump.
const CARD_HEIGHT = 240;

export function MarketCardSkeleton() {
  return (
    <Card
      sx={{
        height: CARD_HEIGHT,
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "none",
        border: 1,
        borderColor: "divider",
        borderRadius: 0.125,
      }}
    >
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="90%" height={26} />
        <Skeleton variant="text" width="70%" height={26} />
        <Skeleton variant="text" width="60%" height={26} />

        <Box sx={{ mt: 0.5 }}>
          <Skeleton variant="text" width="30%" height={18} />
          <Skeleton variant="rounded" width="100%" height={8} />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Skeleton variant="text" width={56} height={22} />
          <Skeleton variant="text" width={86} height={18} />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Skeleton variant="rounded" width={76} height={24} />
          <Skeleton variant="rounded" width={64} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
}
