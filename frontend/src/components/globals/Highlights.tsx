function Highlights() {
  return (
    <section
      className="nexus-motion bg-slate-950 px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="highlights-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <h2 id="highlights-title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Mundos para cada estilo de jogador
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
            Comece pelo gênero que combina com o seu ritmo e refine a busca no catálogo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <article className="group relative min-h-[25rem] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <img
              src="/site/highlights/homemaranha.png"
              alt="Cena de ação e aventura em um jogo"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-[1.75] object-cover transition duration-500 sm:scale-[1.2] md:scale-100 group-hover:scale-[1.8] sm:group-hover:scale-[1.24] md:group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(2,6,23,0.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-3xl font-black text-white">Ação e aventura</h3>
              <p className="mt-2 max-w-xl text-base leading-7 text-slate-200">
                Enfrente desafios intensos e explore histórias em mundos cheios de movimento.
              </p>
            </div>
          </article>

          <article className="group relative min-h-[21rem] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 md:min-h-[25rem]">
            <img
              src="/site/highlights/eldenring.jpg"
              alt="Cena de RPG em um mundo de fantasia"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(2,6,23,0.94)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-3xl font-black text-white">Estratégia e RPG</h3>
              <p className="mt-2 text-base leading-7 text-slate-200">
                Planeje cada decisão e construa sua própria jornada.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Highlights;
