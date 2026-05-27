import { matchPath, useLocation } from "react-router-dom";
import AdminCategories from "../components/admin/categories/AdminCategories";
import AdminCategoryForm from "../components/admin/categories/AdminCategoryForm";
import AdminDashboard from "../components/admin/dashboard/AdminDashboard";
import AdminGameForm from "../components/admin/games/AdminGameForm";
import AdminGamePlatforms from "../components/admin/games/platforms/AdminGamePlatforms";
import AdminGames from "../components/admin/games/AdminGames";
import AdminOffers from "../components/admin/offers/AdminOffers";
import AdminOrderDetails from "../components/admin/orders/AdminOrderDetails";
import AdminOrders from "../components/admin/orders/AdminOrders";
import AdminPriceHistory from "../components/admin/price-history/AdminPriceHistory";
import AdminPlatformForm from "../components/admin/platforms/AdminPlatformForm";
import AdminPlatforms from "../components/admin/platforms/AdminPlatforms";

function matchAdminPath(pathname: string, path: string) {
  return Boolean(matchPath({ path, end: true }, pathname));
}

export default function AdminControl() {
  const { pathname } = useLocation();
  const gamePlatformsMatch = matchPath(
    { path: "/admin/games/:gameId/platforms", end: true },
    pathname,
  );
  const gameEditMatch = matchPath(
    { path: "/admin/games/:id/edit", end: true },
    pathname,
  );
  const categoryEditMatch = matchPath(
    { path: "/admin/categories/:id/edit", end: true },
    pathname,
  );
  const platformEditMatch = matchPath(
    { path: "/admin/platforms/:id/edit", end: true },
    pathname,
  );
  const orderDetailsMatch = matchPath(
    { path: "/admin/orders/:id", end: true },
    pathname,
  );

  if (matchAdminPath(pathname, "/admin/games/new")) {
    return <AdminGameForm />;
  }

  if (gamePlatformsMatch) {
    return <AdminGamePlatforms gameId={gamePlatformsMatch.params.gameId} />;
  }

  if (gameEditMatch) {
    return <AdminGameForm id={gameEditMatch.params.id} />;
  }

  if (matchAdminPath(pathname, "/admin/games")) {
    return <AdminGames />;
  }

  if (orderDetailsMatch) {
    return <AdminOrderDetails orderId={orderDetailsMatch.params.id} />;
  }

  if (matchAdminPath(pathname, "/admin/orders")) {
    return <AdminOrders />;
  }

  if (matchAdminPath(pathname, "/admin/categories/new")) {
    return <AdminCategoryForm />;
  }

  if (categoryEditMatch) {
    return <AdminCategoryForm id={categoryEditMatch.params.id} />;
  }

  if (matchAdminPath(pathname, "/admin/categories")) {
    return <AdminCategories />;
  }

  if (matchAdminPath(pathname, "/admin/platforms/new")) {
    return <AdminPlatformForm />;
  }

  if (platformEditMatch) {
    return <AdminPlatformForm id={platformEditMatch.params.id} />;
  }

  if (matchAdminPath(pathname, "/admin/platforms")) {
    return <AdminPlatforms />;
  }

  if (matchAdminPath(pathname, "/admin/price-history")) {
    return <AdminPriceHistory />;
  }

  if (matchAdminPath(pathname, "/admin/ofertas")) {
    return <AdminOffers />;
  }

  return <AdminDashboard />;
}
