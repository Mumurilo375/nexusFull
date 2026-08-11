import { AlignJustify, Heart, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import AuthRequiredModal from "./AuthRequiredModal";
import NavbarAccountMenu from "./NavbarAccountMenu";
import NavbarMobileMenu from "./NavbarMobileMenu";
import NavbarSearchPopover from "./NavbarSearchPopover";
import type { NavLinkItem } from "./globals.types";
import { useNavbarCounts } from "./useNavbarCounts";

const navLinks: NavLinkItem[] = [
  { to: "/loja", label: "Loja" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/comofunciona", label: "Como funciona" },
  { to: "/admin", label: "Painel admin", adminOnly: true },
];

const iconButtonClass =
  "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";
const countBadgeClass =
  "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white";
const navLinkClass =
  "inline-flex min-h-11 items-center rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-800 hover:bg-slate-900 hover:text-white";

function CountBadge({
  count,
  colorClass,
  isVisible,
}: {
  count: number;
  colorClass: string;
  isVisible: boolean;
}) {
  if (!isVisible || count <= 0) return null;

  return <span className={`${countBadgeClass} ${colorClass}`}>{count}</span>;
}

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const {
    isAdmin,
    isAuthenticated: isLoggedIn,
    logout,
    user: authUser,
  } = useAuth();
  const currentPath = `${location.pathname}${location.search}`;
  const visibleNavLinks = useMemo(
    () => navLinks.filter((link) => !link.adminOnly || isAdmin),
    [isAdmin],
  );
  const { wishlistCount, cartCount } = useNavbarCounts(isLoggedIn, currentPath);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPath]);

  const goToLogin = () => {
    setShowAuthModal(false);
    void navigate("/login", { state: { from: currentPath } });
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    void navigate("/");
  };

  const handleGoToFavorites = () => {
    setIsMobileMenuOpen(false);

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    void navigate("/favoritos");
  };

  return (
    <>
      <AuthRequiredModal
        open={showAuthModal}
        title="Entre para continuar"
        message="Essa ação exige login. Deseja entrar agora?"
        onClose={() => setShowAuthModal(false)}
        onConfirm={goToLogin}
      />

      <nav
        className="fixed top-0 z-50 w-full border-b border-slate-900 bg-black/95"
        aria-label="Navegação principal"
      >
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-1 transition-opacity hover:opacity-90"
          >
            <img
              src="/utils/logo.png"
              alt="Nexus Store — início"
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {visibleNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${navLinkClass} ${
                  location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
                    ? "border-slate-700 bg-slate-900 font-semibold text-white"
                    : ""
                }`}
                aria-current={
                  location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
                    ? "page"
                    : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavbarSearchPopover />

            <button
              type="button"
              onClick={handleGoToFavorites}
              className={`hidden lg:inline-flex ${iconButtonClass}`}
              aria-label="Ir para favoritos"
            >
              <Heart className="h-5 w-5" />
              <CountBadge
                count={wishlistCount}
                colorClass="bg-rose-600"
                isVisible={isLoggedIn}
              />
            </button>

            <Link
              to="/carrinho"
              className={`hidden lg:inline-flex ${iconButtonClass}`}
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              <CountBadge
                count={cartCount}
                colorClass="bg-blue-600"
                isVisible={isLoggedIn}
              />
            </Link>

            <NavbarAccountMenu
              isLoggedIn={isLoggedIn}
              profileLabel={authUser?.username || "Minha conta"}
              avatarUrl={authUser?.avatarUrl}
              onLogout={handleLogout}
            />

            <button
              type="button"
              className={`${iconButtonClass} lg:hidden`}
              onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="menu-mobile-navbar"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <NavbarMobileMenu
          open={isMobileMenuOpen}
          links={visibleNavLinks}
          isLoggedIn={isLoggedIn}
          wishlistCount={wishlistCount}
          cartCount={cartCount}
          onGoToFavorites={handleGoToFavorites}
          onLogout={handleLogout}
        />
      </nav>
    </>
  );
}
