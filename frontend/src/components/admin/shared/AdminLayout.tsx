import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../../globals/Footer";
import NavBar from "../../globals/NavBar";

type AdminLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  backClassName?: string;
  actions?: ReactNode;
};

export default function AdminLayout({
  title,
  description,
  children,
  backTo,
  backLabel = "Voltar",
  backClassName,
  actions,
}: AdminLayoutProps) {
  const location = useLocation();
  const adminLinks = [
    { to: "/admin", label: "Visão geral" },
    { to: "/admin/games", label: "Jogos" },
    { to: "/admin/orders", label: "Pedidos" },
    { to: "/admin/ofertas", label: "Ofertas" },
  ];
  const defaultBackClassName =
    "inline-flex rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white";

  return (
    <div className="nexus-page-shell">
      <NavBar />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-10 pt-28">
        <div className="nexus-panel flex flex-col gap-5 p-6">
          <nav
            className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4"
            aria-label="Navegação administrativa"
          >
            {adminLinks.map((link) => {
              const isActive =
                link.to === "/admin"
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-400/60 bg-blue-500/15 text-blue-100"
                      : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              {backTo && (
                <Link
                  to={backTo}
                  className={`${defaultBackClassName} ${backClassName ?? ""}`.trim()}
                >
                  {backLabel}
                </Link>
              )}
              <h1 className="mt-3 text-3xl font-bold text-slate-50">{title}</h1>
              {description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
