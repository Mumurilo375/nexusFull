/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { RequireAdmin, RequireAuth } from "./components/auth/RouteGuards";
import Footer from "./components/globals/Footer";
import NavBar from "./components/globals/NavBar";
import { AuthProvider } from "./contexts/AuthContext";
import RootLayout from "./components/globals/RootLayout";
import Checkout from "./components/user/checkout/Checkout";
import OrderLibrary from "./components/user/orders/OrderLibrary";
import App from "./pages/App";
import AdminControl from "./pages/AdminControl";
import Cadastro from "./pages/Cadastro";
import Carrinho from "./pages/Carrinho";
import ComoFunciona from "./pages/ComoFunciona";
import Favoritos from "./pages/Favoritos";
import GameDetails from "./pages/GameDetails";
import Login from "./pages/Login";
import Loja from "./pages/Loja";
import Ofertas from "./pages/Ofertas";
import OfertaDetalhe from "./pages/OfertaDetalhe";
import UserConfig from "./pages/UserConfig";
import ErrorPage from "./pages/ErrorPage";

function CheckoutPage() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <Checkout />
      <Footer />
    </div>
  );
}

function MeusPedidosPage() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <OrderLibrary />
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
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
