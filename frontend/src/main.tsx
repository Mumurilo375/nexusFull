/* eslint-disable react-refresh/only-export-components */
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { RequireAdmin, RequireAuth } from "./components/auth/RouteGuards";
import Footer from "./components/globals/Footer";
import NavBar from "./components/globals/NavBar";
import { AuthProvider } from "./contexts/AuthContext";
import RootLayout from "./components/globals/RootLayout";
const App = lazy(() => import("./pages/App"));
const AdminControl = lazy(() => import("./pages/AdminControl"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Carrinho = lazy(() => import("./pages/Carrinho"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const GameDetails = lazy(() => import("./pages/GameDetails"));
const Login = lazy(() => import("./pages/Login"));
const Loja = lazy(() => import("./pages/Loja"));
const Ofertas = lazy(() => import("./pages/Ofertas"));
const OfertaDetalhe = lazy(() => import("./pages/OfertaDetalhe"));
const UserConfig = lazy(() => import("./pages/UserConfig"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const LazyCheckout = lazy(() => import("./components/user/checkout/Checkout"));
const LazyOrderLibrary = lazy(() => import("./components/user/orders/OrderLibrary"));

function RouteLoading() {
  return (
    <div className="nexus-page-shell flex min-h-screen items-center justify-center px-6 text-slate-300" role="status">
      Carregando página...
    </div>
  );
}

function CheckoutPage() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <LazyCheckout />
      <Footer />
    </div>
  );
}

function MeusPedidosPage() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <LazyOrderLibrary />
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/loja", element: <Loja /> },
      { path: "/ofertas", element: <Ofertas /> },
      { path: "/ofertas/:offerId", element: <OfertaDetalhe /> },
      { path: "/comofunciona", element: <ComoFunciona /> },
      { path: "/login", element: <Login /> },
      { path: "/cadastro", element: <Cadastro /> },
      { path: "/loja/:gameId", element: <GameDetails /> },
      {
        path: "/admin/*",
        element: (
          <RequireAdmin>
            <AdminControl />
          </RequireAdmin>
        ),
      },
      {
        path: "/favoritos",
        element: (
          <RequireAuth>
            <Favoritos />
          </RequireAuth>
        ),
      },
      {
        path: "/carrinho",
        element: (
          <RequireAuth>
            <Carrinho />
          </RequireAuth>
        ),
      },
      {
        path: "/checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: "/meus-pedidos",
        element: (
          <RequireAuth>
            <MeusPedidosPage />
          </RequireAuth>
        ),
      },
      {
        path: "/configuracoes",
        element: (
          <RequireAuth>
            <UserConfig />
          </RequireAuth>
        ),
      },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Suspense fallback={<RouteLoading />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </StrictMode>,
);
