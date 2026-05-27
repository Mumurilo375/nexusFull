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
  "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-950/75 text-slate-200 transition hover:border-slate-600 hover:text-white";
const countBadgeClass =
  "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white";
const navLinkClass = "text-sm text-slate-300 transition hover:text-white";

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
    setIsMobileMenuOpen(false);
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

      <nav className="fixed top-0 z-50 w-full border-b border-slate-900/80 bg-black/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <img
              src="/utils/logo.png"
              alt="Logo Nexus"
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {visibleNavLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavbarSearchPopover />

            <button
              type="button"
              onClick={handleGoToFavorites}
              className={`hidden md:inline-flex ${iconButtonClass}`}
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
              className={`hidden md:inline-flex ${iconButtonClass}`}
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
              className={`${iconButtonClass} md:hidden`}
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
