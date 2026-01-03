import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { ScrollToTop } from "./ScrollToTop";

import { HomePage } from "../pages/HomePage";
import { MarketsPage } from "../pages/MarketsPage";
import { MarketDetailPage } from "../pages/MarketDetailPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { ActivityPage } from "../pages/ActivityPage";
import { WatchlistPage } from "../pages/WatchlistPage";
import { WalletPage } from "../pages/WalletPage";
import { ProfilePage } from "../pages/ProfilePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { CollectionDetailPage } from "../pages/CollectionDetailPage";
import { CategoryPage } from "../pages/CategoryPage";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <AppShell />
      </>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/markets", element: <MarketsPage /> },
      { path: "/markets/:marketId", element: <MarketDetailPage /> },
      { path: "/portfolio", element: <PortfolioPage /> },
      { path: "/activity", element: <ActivityPage /> },
      { path: "/watchlist", element: <WatchlistPage /> },
      { path: "/wallet", element: <WalletPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/collections", element: <CollectionsPage /> },
      { path: "/collections/:id", element: <CollectionDetailPage /> },
      { path: "/category/:slug", element: <CategoryPage /> },
    ],
  },
]);
