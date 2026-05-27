const steps = [
  {
    title: "Compre a key",
    description:
      "Escolha o jogo, selecione a plataforma e finalize a compra no checkout da demo.",
  },
  {
    title: "Acesse sua biblioteca",
    description:
      "Assim que o pedido é aprovado, a key aparece na sua área de pedidos e biblioteca.",
  },
  {
    title: "Resgate e jogue",
    description:
      "Cole o código na Steam, Xbox, PlayStation ou Nintendo para ativar o jogo.",
  },
];

export default function Steps() {
  return (
    <section className="w-full -mt-15 bg-slate-950 px-4 py-16 sm:px-6 sm:py-18">
      <div className="mx-auto justify-center w-full max-w-6xl">
        <div className="max-w-2xl text-center mx-auto mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
            Passo a passo
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            Do carrinho ao resgate
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            O processo foi desenhado para ser simples: você compra, recebe a
            key e ativa o jogo direto na plataforma correspondente.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_18px_45px_rgba(2,6,23,0.3)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-100">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
