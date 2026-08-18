import { CirclePlay, Compass, Gamepad2, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const trailerUrl =
  "https://www.youtube.com/embed/RJ7eRQgJBbo?autoplay=1&rel=0";

function Hero() {
  const [trailerStarted, setTrailerStarted] = useState(false);

  return (
    <section
      className="nexus-motion relative isolate overflow-hidden bg-slate-950 pt-[4.5rem]"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <picture className="block h-full w-full">
          <source
            media="(min-width: 768px)"
            srcSet="/utils/residenthero7.webp"
            type="image/webp"
          />
          <source srcSet="/utils/residenthero-mobile.webp" type="image/webp" />
          <img
            src="/utils/residenthero3.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center md:object-[58%_center]"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.88)_38%,rgba(2,6,23,0.24)_76%,rgba(2,6,23,0.36)_100%)] md:bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.9)_34%,rgba(2,6,23,0.22)_66%,rgba(2,6,23,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1)_0%,rgba(2,6,23,0.08)_50%,rgba(2,6,23,0.96)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-7xl flex-col justify-center px-4 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-20 lg:min-h-[50rem] lg:px-14 lg:pb-16 lg:pt-24">
        <div className="max-w-[40rem]">
          <h1
            id="hero-title"
            className="max-w-[13ch] text-balance text-[clamp(3rem,8vw,5.75rem)] font-black leading-[0.94] tracking-[-0.04em] text-white"
          >
            Entre no próximo nível
          </h1>
          <p className="mt-6 max-w-[36rem] text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            Explore novos mundos, compare jogos e acompanhe uma compra simulada
            de keys para diferentes plataformas.
          </p>

          <div className="mt-8 flex max-w-[36rem] flex-col gap-3 sm:flex-row">
            <Link
              to="/loja"
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-black text-white shadow-[0_16px_34px_rgba(37,99,235,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <Gamepad2 className="h-5 w-5" aria-hidden="true" />
              Explorar jogos
            </Link>
            <Link
              to="/comofunciona"
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-600 bg-slate-950/85 px-6 py-3.5 text-base font-bold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <Compass className="h-5 w-5 text-blue-200" aria-hidden="true" />
              Como funciona
            </Link>
          </div>
        </div>

        <div className="mt-10 w-full max-w-[48rem] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 sm:mt-12">
          <div className="relative aspect-[16/7] overflow-hidden bg-slate-900 sm:aspect-[21/7]">
            {trailerStarted ? (
              <iframe
                className="h-full w-full"
                src={trailerUrl}
                title="Trailer de Resident Evil Requiem"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src="/utils/residenthero.jpg"
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.2)_48%,rgba(2,6,23,0.86)_100%)]" />
                <button
                  type="button"
                  onClick={() => setTrailerStarted(true)}
                  className="group absolute inset-0 flex items-center justify-end gap-3 px-5 text-right text-white transition hover:bg-slate-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-inset sm:gap-4 sm:px-8"
                  aria-label="Assistir ao trailer de Resident Evil Requiem"
                >
                  <span className="hidden sm:block">
                    <span className="block text-xs font-semibold text-slate-300">
                      Resident Evil Requiem
                    </span>
                    <span className="mt-1 block text-sm font-black sm:text-base">
                      Assistir ao trailer
                    </span>
                  </span>
                  <span className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.36)] transition duration-300 group-hover:scale-105 group-hover:bg-blue-500 sm:h-15 sm:w-15">
                    <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" aria-hidden="true" />
                  </span>
                </button>
              </>
            )}
          </div>
          {!trailerStarted && (
            <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 sm:hidden">
              <CirclePlay className="h-4 w-4 text-blue-300" aria-hidden="true" />
              Assistir ao trailer de Resident Evil Requiem
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
