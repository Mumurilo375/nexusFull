import { Link } from "react-router-dom";

function Footer() {
  const supportItems = [
    "Central de ajuda",
    "Contato",
    "Politica de reembolso",
  ];
  const legalItems = ["Termos de uso", "Cookies", "Privacidade"];

  return (
    <footer className="border-t border-white/8 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.1),_transparent_32%),linear-gradient(180deg,#020617_0%,#02050f_100%)] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
          <div className="max-w-md">
            <h2 className="text-3xl font-black text-white">Nexus</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Descubra novos mundos, encontre grandes jogos e tenha acesso
              rápido às suas keys para ativar e jogar quando quiser.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              Navegação
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <Link
                to="/loja"
                className="block transition hover:text-blue-200"
              >
                Loja
              </Link>
              <Link
                to="/ofertas"
                className="block transition hover:text-blue-200"
              >
                Ofertas
              </Link>
              <Link
                to="/comofunciona"
                className="block transition hover:text-blue-200"
              >
                Como funciona
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              Suporte
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {supportItems.map((item) => (
                <span key={item} className="block">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              Legal
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {legalItems.map((item) => (
                <span key={item} className="block">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <img src="/utils/logo.png" alt="Logo Nexus" className="h-5 w-auto" />
            <span>Nexus Store © 2026 |</span>
            <span>Desenvolvido por</span>
            <a
              href="https://github.com/Mumurilo375"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-200"
            >
              Murilo Pereira
            </a>
            <span>e</span>
            <a
              href="https://github.com/Izaac-eduardo"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-200"
            >
              Izaac Eduardo.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
