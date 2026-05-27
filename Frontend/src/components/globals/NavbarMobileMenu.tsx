import {
  Heart,
  LogOut,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { NavLinkItem } from "./globals.types";

const mobileItemClass =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white";

export default function NavbarMobileMenu({
  open,
  links,
  isLoggedIn,
  wishlistCount,
  cartCount,
  onGoToFavorites,
  onLogout,
}: {
  open: boolean;
  links: NavLinkItem[];
  isLoggedIn: boolean;
  wishlistCount: number;
  cartCount: number;
  onGoToFavorites: () => void;
  onLogout: () => void;
}) {
  if (!open) return null;

  return (
    <div
      id="menu-mobile-navbar"
      className="border-t border-slate-900 bg-black/95 px-4 pb-4 pt-3 md:hidden"
    >
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={mobileItemClass}>
            {link.label}
          </Link>
        ))}

        <div className="my-1 h-px bg-slate-800" />

        <button type="button" onClick={onGoToFavorites} className={mobileItemClass}>
          <Heart className="h-4 w-4" /> Favoritos {isLoggedIn ? `(${wishlistCount})` : ""}
        </button>

        <Link to="/carrinho" className={mobileItemClass}>
          <ShoppingCart className="h-4 w-4" /> Carrinho {isLoggedIn ? `(${cartCount})` : ""}
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/configuracoes" className={mobileItemClass}>
              <Settings className="h-4 w-4" /> Configurações
            </Link>
            <Link to="/meus-pedidos" className={mobileItemClass}>
              <ReceiptText className="h-4 w-4" /> Meus pedidos e keys
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className={`${mobileItemClass} text-rose-200 hover:text-rose-100`}
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </>
        ) : (
          <Link to="/login" className={mobileItemClass}>
            <UserRound className="h-4 w-4" /> Entrar
          </Link>
        )}
      </div>
    </div>
  );
}
