// src/components/MarketChatSkeleton.tsx
import { Avatar, Box, Divider, Paper, Skeleton, Stack, Typography } from "@mui/material";

function MessageSkeleton({ isReply }: { isReply?: boolean }) {
  return (
    <Box
      sx={{
        pl: isReply ? 3.25 : 0,
        borderLeft: isReply ? "1px solid" : "none",
        borderColor: isReply ? "divider" : undefined,
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="flex-start">
        <Avatar
          sx={{
            width: isReply ? 28 : 34,
            height: isReply ? 28 : 34,
            bgcolor: "rgba(0,0,0,0.08)",
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Skeleton variant="text" width={96} height={18} />
            <Skeleton variant="text" width={64} height={14} />
          </Stack>
          <Skeleton variant="text" width="92%" />
          <Skeleton variant="text" width="76%" />
          <Stack direction="row" spacing={1} sx={{ mt: 0.6 }}>
            <Skeleton variant="rounded" width={56} height={22} />
            <Skeleton variant="rounded" width={72} height={22} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export function MarketChatSkeleton() {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="h6">Chat</Typography>
          <Skeleton variant="text" width={72} height={16} />
        </Stack>
        <Divider />

        <Stack spacing={1}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={30} width={160} sx={{ alignSelf: "flex-end" }} />
        </Stack>

        <Divider />

        <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <MessageSkeleton />
          <MessageSkeleton isReply />
          <MessageSkeleton />
        </Stack>
      </Stack>
    </Paper>
  );
}
