import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const platforms = [
  {
    id: "PlayStation",
    consoleImage: "/plataforms/playstationConsole.webp",
    imageWidth: 1080,
    imageHeight: 1080,
    description: "Explore jogos disponíveis para os consoles PlayStation.",
    accentClass: "bg-blue-500",
    tintClass: "bg-blue-500/10",
  },
  {
    id: "Xbox",
    consoleImage: "/plataforms/xboxConsole.webp",
    imageWidth: 857,
    imageHeight: 676,
    description: "Encontre títulos para jogar no ecossistema Xbox.",
    accentClass: "bg-emerald-500",
    tintClass: "bg-emerald-500/10",
  },
  {
    id: "Nintendo Switch",
    consoleImage: "/plataforms/nintendoconsole.webp",
    imageWidth: 666,
    imageHeight: 375,
    description: "Veja o catálogo disponível para Nintendo Switch.",
    accentClass: "bg-rose-500",
    tintClass: "bg-rose-500/10",
  },
  {
    id: "Steam",
    consoleImage: "/plataforms/computador2.webp",
    imageWidth: 500,
    imageHeight: 500,
    description: "Descubra jogos para PC disponíveis na Steam.",
    accentClass: "bg-cyan-400",
    tintClass: "bg-cyan-400/10",
  },
] as const;

export default function Platforms() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageIsVisible, setPageIsVisible] = useState(true);
  const currentPlatform = platforms[currentIndex];
  const rotationIsPaused =
    isHovering || hasFocusWithin || prefersReducedMotion || !pageIsVisible;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    const updateVisibility = () => setPageIsVisible(document.visibilityState === "visible");

    updateMotionPreference();
    updateVisibility();
    mediaQuery.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (rotationIsPaused) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % platforms.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [rotationIsPaused]);

  useEffect(() => {
    platforms.slice(1).forEach(({ consoleImage }) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = "low";
      image.src = consoleImage;
    });
  }, []);

  return (
    <section
      id="plataformas"
      className="nexus-motion bg-slate-950 px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="platforms-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h2
              id="platforms-title"
              className="text-4xl font-black tracking-tight text-white sm:text-5xl"
            >
              Escolha onde você joga
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300 sm:text-lg">
              Abra o catálogo já filtrado pela sua plataforma e compare as opções disponíveis.
            </p>
          </div>

        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Plataformas disponíveis"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onFocus={() => setHasFocusWithin(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setHasFocusWithin(false);
            }
          }}
        >
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-2/3 ${currentPlatform.tintClass}`}
            aria-hidden="true"
          />
          <div className={`absolute inset-y-0 left-0 w-1 ${currentPlatform.accentClass}`} />

          <article className="relative grid min-h-[30rem] items-center gap-4 px-6 py-8 sm:px-10 md:min-h-[27rem] md:grid-cols-[minmax(0,0.78fr)_minmax(22rem,1.22fr)] md:py-10 lg:px-14">
            <div className="z-10 max-w-lg">
              <h3 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {currentPlatform.id}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {currentPlatform.description}
              </p>
              <Link
                to={`/loja?platform=${encodeURIComponent(currentPlatform.id)}`}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Ver jogos para {currentPlatform.id}
              </Link>
            </div>

            <div className="flex min-h-64 items-center justify-center md:min-h-80">
              <img
                key={currentPlatform.id}
                src={currentPlatform.consoleImage}
                alt={`Console ou dispositivo da plataforma ${currentPlatform.id}`}
                width={currentPlatform.imageWidth}
                height={currentPlatform.imageHeight}
                loading="eager"
                fetchPriority={currentIndex === 0 ? "high" : "auto"}
                decoding="async"
                className="max-h-72 w-full object-contain p-3 transition duration-500 ease-out md:max-h-96 md:p-6"
              />
            </div>
          </article>

          <div className="relative flex flex-wrap gap-2 border-t border-slate-800 bg-slate-950/70 p-3 sm:p-4">
            {platforms.map((platform, index) => {
              const isActive = index === currentIndex;

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:flex-none sm:px-4 ${
                    isActive
                      ? "border-blue-400 bg-blue-500/15 text-white"
                      : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                  }`}
                  aria-pressed={isActive}
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
