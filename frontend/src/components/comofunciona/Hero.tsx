function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_42%),linear-gradient(180deg,#020617_0%,#030712_100%)] px-4 py-20 sm:py-24">
      <div className="mx-auto flex min-h-[52vh] w-full max-w-5xl flex-col items-center justify-center gap-5 text-center">
        <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
          Guia Nexus
        </span>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Como funcionam as keys?
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Keys são códigos digitais que liberam o jogo diretamente na
          plataforma escolhida. No Nexus você compra, recebe a key na hora e
          faz o resgate na sua conta com poucos passos.
        </p>
      </div>
    </section>
  );
}
export default Hero;
