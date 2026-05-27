import { Link } from "react-router-dom";

function Intro() {
  const specs = [
    {
      value: "Ativação Simples",
      label: "Copie a key, ative e jogue.",
    },
    {
      value: "Entrega Imediata",
      label: "Receba sua key logo após a compra.",
    },
    {
      value: "Suporte a todo momento",
      label: "Atendimento disponível a qualquer hora.",
    },
    {
      value: "Grandes jogos para você",
      label: "Explore vários títulos na nossa biblioteca.",
    },
  ];
  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_34%),linear-gradient(180deg,#020617_0%,#030712_100%)] px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
          Nexus Store
        </span>
        <h1 className="mb-6 mt-5 text-6xl font-bold text-white md:text-8xl">
          NEXUS
        </h1>
        <p className="mb-4 text-2xl font-bold text-blue-100 md:text-4xl">
          Entre no próximo nível
        </p>
        <p className="text-lg leading-8 text-slate-300 md:text-xl">
          Descubra novos mundos, encontre grandes jogos e tenha acesso rápido às
          suas keys para ativar e jogar quando quiser.
        </p>
      </div>
      <div className="mb-16 mt-8 flex justify-center gap-4">
        <Link to="/loja" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:scale-105 hover:bg-blue-500">
          Comprar Agora
        </Link>
        <Link to="/comofunciona" className="rounded-full border border-slate-700 bg-slate-950/70 px-8 py-3 font-semibold text-slate-200 shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:text-white">
          Saiba Mais
        </Link>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
        {specs.map((spec, index) => (
          <div key={index} className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_18px_45px_rgba(2,6,23,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30">
            <p className="mb-2 text-2xl font-bold text-white">{spec.value}</p>
            <p className="text-slate-300">{spec.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default Intro;
