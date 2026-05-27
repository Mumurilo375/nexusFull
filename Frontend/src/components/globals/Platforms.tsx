import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const PlaystationConsole = "/plataforms/playstationConsole.png";
const XboxConsole = "/plataforms/xboxConsole.png";
const NintendoConsole = "/plataforms/nintendoconsole.png";
const PcConsole = "/plataforms/computador2.png";

const platforms = [
  {
    id: "PlayStation",
    consoleImage: PlaystationConsole,
    accent: "from-blue-500/7 via-blue-900/5 to-transparent",
  },
  {
    id: "Xbox",
    consoleImage: XboxConsole,
    accent: "from-green-500/7 via-green-900/5 to-transparent",
  },
  {
    id: "Nintendo Switch",
    consoleImage: NintendoConsole,
    accent: "from-red-500/7 via-red-900/5 to-transparent",
  },
  {
    id: "Steam",
    consoleImage: PcConsole,
    accent: "from-slate-200/7 via-slate-700/5 to-transparent",
  },
];

export default function Platforms() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex(
      (previous) => (previous - 1 + platforms.length) % platforms.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous + 1) % platforms.length);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % platforms.length);
    }, 5250);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      id="plataforms"
      className="bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(180deg,#020617_0%,#030712_100%)] px-8 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold text-white md:text-6xl">
            Escolha sua plataforma
          </h2>
          <p className="text-xl text-slate-400">4 plataformas para jogar</p>
        </div>

        <div className="mx-auto w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/78 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white transition hover:scale-105 hover:bg-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white transition hover:scale-105 hover:bg-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Próximo slide"
            >
              <ChevronRight className="size-6" />
            </button>

            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {platforms.map((platform) => {
                return (
                  <article key={platform.id} className="relative min-w-full">
                    <Link
                      to={`/loja?platform=${encodeURIComponent(platform.id)}`}
                      className="group block"
                      aria-label={`Ir para loja com filtro de ${platform.id}`}
                    >
                      <div
                        className={`absolute inset-0 bg-linear-to-b ${platform.accent}`}
                      ></div>

                      <img
                        src={platform.consoleImage}
                        alt={platform.id}
                        className="mx-auto h-90 w-full object-contain p-8 transition duration-300 group-hover:scale-[1.02] sm:h-105"
                      />

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-7 py-3 backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-white sm:text-2xl">
                          {platform.id}
                        </h3>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {platforms.map((platform, index) => {
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    index === currentIndex
                      ? "border-blue-400/50 bg-blue-500/15 text-blue-100"
                      : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-blue-300/35 hover:text-white"
                  }`}
                  aria-pressed={index === currentIndex}
                >
                  {platform.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
