import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { MarketsPage } from "../pages/MarketsPage";
import { MarketDetailPage } from "../pages/MarketDetailPage";
import { CategoryPage } from "../pages/CategoryPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { CollectionDetailPage } from "../pages/CollectionDetailPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { WalletPage } from "../pages/WalletPage";
import { ActivityPage } from "../pages/ActivityPage";
import { WatchlistPage } from "../pages/WatchlistPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { ProfilePage } from "../pages/ProfilePage";
import { HomePage } from "../pages/HomePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/markets", element: <MarketsPage /> },
      { path: "/markets/:id", element: <MarketDetailPage /> },
      { path: "/categories/:category", element: <CategoryPage /> },
      { path: "/collections", element: <CollectionsPage /> },
      { path: "/collections/:id", element: <CollectionDetailPage /> },
      { path: "/watchlist", element: <WatchlistPage /> },
      { path: "/portfolio", element: <PortfolioPage /> },
      { path: "/wallet", element: <WalletPage /> },
      { path: "/activity", element: <ActivityPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);
