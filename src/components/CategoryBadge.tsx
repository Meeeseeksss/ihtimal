import { Chip } from "@mui/material";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import type { MarketCategory } from "../data/mockMarkets";

export function CategoryBadge({ category }: { category: MarketCategory }) {
  if (category === "CRYPTO") {
    return (
      <Chip
        size="small"
        icon={<CurrencyBitcoinIcon />}
        label="Crypto"
        variant="outlined"
        sx={{ bgcolor: "rgba(15, 23, 42, 0.02)" }}
      />
    );
  }

  if (category === "POLITICS") {
    return (
      <Chip
        size="small"
        icon={<HowToVoteIcon />}
        label="Politics"
        variant="outlined"
        sx={{ bgcolor: "rgba(15, 23, 42, 0.02)" }}
      />
    );
  }

  return (
    <Chip
      size="small"
      icon={<SportsSoccerIcon />}
      label="Sports"
      variant="outlined"
      sx={{ bgcolor: "rgba(15, 23, 42, 0.02)" }}
    />
  );
}
