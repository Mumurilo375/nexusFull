function Highlights() {
  return (
    <section className="bg-[linear-gradient(180deg,#020617_0%,#030712_100%)] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-5xl font-bold text-white md:text-6xl">
            Para Todos os Tipos de Jogador
          </h2>
          <p className="my-7 text-xl text-slate-400">
            Descubra jogos de diferentes gêneros e estilos em um só lugar.
          </p>
        </div>
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-[30px] border border-slate-800 bg-slate-950/78 p-8 shadow-[0_18px_45px_rgba(2,6,23,0.3)]">
            <img
              src="/site/highlights/homemaranha.png"
              alt="wukong-game"
              className="mb-4 h-64 w-full rounded-2xl border border-slate-800 object-cover"
            />
            <h3 className="mb-2 text-3xl font-bold text-white">Ação e Aventura</h3>
            <p className="text-slate-300">
              Enfrente desafios intensos e explore novos mundos.
            </p>
          </div>
          <div className="rounded-[30px] border border-slate-800 bg-slate-950/78 p-8 shadow-[0_18px_45px_rgba(2,6,23,0.3)]">
            <img
              src="/site/highlights/eldenring.jpg"
              alt="eldenring-game"
              className="mb-4 h-64 w-full rounded-2xl border border-slate-800 object-cover"
            />
            <h3 className="mb-2 text-3xl font-bold text-white">Estratégia e RPG</h3>
            <p className="text-slate-300">
              Planeje cada movimento e construa sua jornada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Highlights;
