import { ArrowLeft, House, TriangleAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <section className="nexus-panel relative w-full max-w-3xl px-6 py-10 text-center sm:px-10">
        <img
          src="/utils/logo.png"
          alt="Logo Nexus"
          className="mx-auto mb-7 h-14 w-auto sm:h-16"
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
          <TriangleAlert className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          Erro 404
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
          Essa rota caiu em uma fenda espacial.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
          A página que você tentou acessar não existe ou foi movida. Use os
          botões abaixo para voltar para um caminho seguro.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/60 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
          >
            <House className="h-4 w-4" />
            Ir para Home
          </Link>
        </div>
      </section>
    </main>
  );
}
