const faqItems = [
  {
    question: "O que são keys de jogos?",
    answer:
      "Keys são códigos alfanuméricos que liberam jogos digitais em plataformas como Steam, Xbox, PlayStation e Nintendo.",
  },
  {
    question: "O que faço se minha key não funcionar?",
    answer:
      "Como o Nexus é uma demo acadêmica, a entrega é simulada. Em um projeto real, esse seria o ponto de acionar suporte e validar a compra.",
  },
  {
    question: "Posso usar a mesma key em várias contas?",
    answer:
      "Não. Uma key válida normalmente pode ser resgatada apenas uma vez e fica vinculada a uma única conta.",
  },
];

export default function FrequentlyAskedQuestions() {
  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.1),_transparent_35%),linear-gradient(180deg,#020617_0%,#030712_100%)] px-4 py-18 sm:py-20">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
          FAQ
        </h2>
        <h1 className="mb-12 mt-4 text-center text-3xl font-bold text-white sm:text-5xl">
          Perguntas frequentes
        </h1>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-[24px] border border-slate-800 bg-slate-950/80 px-6 py-5 shadow-[0_18px_45px_rgba(2,6,23,0.28)]"
            >
              <summary className="cursor-pointer list-none text-left text-lg font-semibold text-slate-100">
                {item.question}
              </summary>
              <p className="mt-3 text-left text-sm leading-7 text-slate-300">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
