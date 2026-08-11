import {
  BadgePercent,
  CircleHelp,
  Gamepad2,
  Heart,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { NavLinkItem } from "./globals.types";

const linkIcons = {
  "/loja": Gamepad2,
  "/ofertas": BadgePercent,
  "/comofunciona": CircleHelp,
  "/admin": LayoutDashboard,
};

const mobileItemClass =
  "flex min-h-13 items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-base font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";

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
  const location = useLocation();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      id="menu-mobile-navbar"
      className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto border-t border-slate-800 bg-slate-950 px-4 pb-8 pt-5 lg:hidden"
    >
      <div className="mx-auto max-w-lg">
        <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Navegar
        </p>
        <div className="mt-2 flex flex-col gap-1">
          {links.map((link) => {
            const Icon = linkIcons[link.to as keyof typeof linkIcons] ?? Gamepad2;
            const isActive =
              location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`${mobileItemClass} ${
                  isActive ? "border-slate-700 bg-slate-900 text-white" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="my-5 h-px bg-slate-800" />

        <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Sua área
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={onGoToFavorites} className={mobileItemClass}>
            <Heart className="h-5 w-5 text-rose-300" aria-hidden="true" />
            <span>
              Favoritos
              {isLoggedIn && wishlistCount > 0 && (
                <span className="ml-1 text-sm text-slate-400">({wishlistCount})</span>
              )}
            </span>
          </button>

          <Link to="/carrinho" className={mobileItemClass}>
            <ShoppingCart className="h-5 w-5 text-blue-300" aria-hidden="true" />
            <span>
              Carrinho
              {isLoggedIn && cartCount > 0 && (
                <span className="ml-1 text-sm text-slate-400">({cartCount})</span>
              )}
            </span>
          </Link>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          {isLoggedIn ? (
            <>
              <Link to="/configuracoes" className={mobileItemClass}>
                <Settings className="h-5 w-5 text-slate-400" aria-hidden="true" />
                Configurações
              </Link>
              <Link to="/meus-pedidos" className={mobileItemClass}>
                <ReceiptText className="h-5 w-5 text-slate-400" aria-hidden="true" />
                Meus pedidos e keys
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className={`${mobileItemClass} text-rose-200 hover:text-rose-100`}
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500">
              <UserRound className="h-5 w-5" aria-hidden="true" />
              Entrar na conta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
