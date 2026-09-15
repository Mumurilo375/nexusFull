import { lazy } from "react";
import { matchPath, useLocation } from "react-router-dom";

const AdminCategories = lazy(() => import("../components/admin/categories/AdminCategories"));
const AdminCategoryForm = lazy(() => import("../components/admin/categories/AdminCategoryForm"));
const AdminDashboard = lazy(() => import("../components/admin/dashboard/AdminDashboard"));
const AdminGameForm = lazy(() => import("../components/admin/games/AdminGameForm"));
const AdminGamePlatforms = lazy(() => import("../components/admin/games/platforms/AdminGamePlatforms"));
const AdminGames = lazy(() => import("../components/admin/games/AdminGames"));
const AdminOffers = lazy(() => import("../components/admin/offers/AdminOffers"));
const AdminOrderDetails = lazy(() => import("../components/admin/orders/AdminOrderDetails"));
const AdminOrders = lazy(() => import("../components/admin/orders/AdminOrders"));
const AdminPriceHistory = lazy(() => import("../components/admin/price-history/AdminPriceHistory"));
const AdminPlatformForm = lazy(() => import("../components/admin/platforms/AdminPlatformForm"));
const AdminPlatforms = lazy(() => import("../components/admin/platforms/AdminPlatforms"));

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
