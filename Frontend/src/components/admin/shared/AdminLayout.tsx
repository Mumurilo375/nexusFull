import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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
  const defaultBackClassName =
    "inline-flex rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white";

  return (
    <div className="nexus-page-shell">
      <NavBar />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-10 pt-28">
        <div className="nexus-panel flex flex-col gap-5 p-6">
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

