import { Box, Card, CardActionArea, CardContent, Chip, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SecondaryNav } from "../layout/SecondaryNav";
import { TopicBubbles } from "../components/TopicBubbles";
import { useCollections } from "../data/marketsApi";

export function CollectionsPage() {
  const { data, isLoading, isError } = useCollections();

  return (
    <Box sx={{ pt: 1, width: "100%" }}>
      <SecondaryNav />
      <TopicBubbles />

      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Typography variant="h5">Collections</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Curated groups of markets (UI-only mock data)
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />

        {isError ? (
          <Typography variant="body2" sx={{ color: "error.main" }}>
            Failed to load collections.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} sx={{ border: 1, borderColor: "divider", boxShadow: "none" }}>
                    <CardContent sx={{ display: "grid", gap: 1 }}>
                      <Skeleton variant="text" width="55%" height={28} />
                      <Skeleton variant="text" width="85%" height={20} />
                      <Stack direction="row" spacing={1}>
                        <Skeleton variant="rounded" width={88} height={26} />
                        <Skeleton variant="rounded" width={72} height={26} />
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              : (data ?? []).map((c) => (
                  <Card
                    key={c.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      boxShadow: "none",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardActionArea component={RouterLink} to={`/collections/${c.id}`}>
                      <CardContent sx={{ display: "grid", gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {c.title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {c.description}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={`${c.marketIds.length} markets`} variant="outlined" />
                          {c.primaryCategory && (
                            <Chip size="small" label={c.primaryCategory} variant="outlined" />
                          )}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
