import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Intro() {
  return (
    <section
      className="nexus-motion bg-slate-950 px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="intro-title"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="intro-title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Escolha seu próximo jogo
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Grandes histórias, mundos novos e a plataforma certa para jogar.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/loja"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Explorar a loja
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/comofunciona"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Como funciona
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Intro;
