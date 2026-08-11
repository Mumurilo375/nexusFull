import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Hero() {
  const [trailerStarted, setTrailerStarted] = useState(false);

  return (
    <section
      className="nexus-motion relative isolate flex min-h-[clamp(40rem,92svh,54rem)] items-center overflow-hidden bg-slate-950 pt-20"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/utils/residenthero.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94)_0%,rgba(2,6,23,0.74)_42%,rgba(2,6,23,0.3)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.2)_52%,rgba(2,6,23,0.9)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(28rem,1.15fr)] lg:gap-14 lg:px-14 lg:py-20">
        <div className="max-w-xl">
          <h1 id="hero-title" className="max-w-2xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="block text-blue-100">NEXUS</span>
            <span className="mt-3 block">Entre no próximo nível</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
            Explore novos mundos, compare jogos e acompanhe um fluxo de compra
            simulado com keys para diferentes plataformas.
          </p>
          <Link
            to="/loja"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:text-base"
          >
            Explorar jogos
          </Link>
        </div>

        <div className="w-full max-w-3xl justify-self-end rounded-3xl border border-slate-700 bg-slate-950 p-3 shadow-[0_22px_70px_rgba(2,6,23,0.45)] sm:p-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
            {trailerStarted ? (
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/RJ7eRQgJBbo"
                title="Trailer de Resident Evil Requiem"
                frameBorder="0"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0">
                <img
                  src="/utils/residenthero.jpg"
                  alt="Cena de Resident Evil Requiem"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/45" />
                <button
                  type="button"
                  onClick={() => setTrailerStarted(true)}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white transition hover:bg-slate-950/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-inset"
                  aria-label="Reproduzir trailer de Resident Evil Requiem"
                >
                  <PlayCircle className="h-14 w-14 text-blue-200 transition group-hover:scale-105 group-hover:text-white" aria-hidden="true" />
                  <span className="text-sm font-semibold sm:text-base">Assistir ao trailer</span>
                </button>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            Resident Evil Requiem mistura terror e ação em uma nova investigação ligada ao desastre de Raccoon City.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
