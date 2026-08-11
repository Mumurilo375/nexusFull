import playLogo from "../../assets/playlogo.png";
import xboxLogo from "../../assets/xbox.png";
import steamLogo from "../../assets/steam.png";
import nintendoLogo from "../../assets/nintendo.png";

const platformGuides = [
  {
    title: "PlayStation",
    logo: playLogo,
    steps: [
      {
        heading: "No console",
        items: [
          "Abra a PlayStation Store.",
          'Role o menu lateral até "Resgatar códigos".',
          "Digite a key com cuidado e confirme.",
        ],
      },
      {
        heading: "No site",
        items: [
          "Acesse store.playstation.com e faça login.",
          'Abra o menu do avatar e clique em "Resgatar códigos".',
          "Cole a key e conclua o resgate.",
        ],
      },
    ],
  },
  {
    title: "Xbox",
    logo: xboxLogo,
    steps: [
      {
        heading: "No console",
        items: [
          "Pressione o botao Xbox para abrir o guia.",
          'Entre em Store e escolha "Resgatar código".',
          "Digite o código de 25 caracteres e confirme.",
        ],
      },
      {
        heading: "Na Microsoft Store",
        items: [
          "Abra a Microsoft Store no PC e faça login.",
          'Use o menu de opções para abrir "Resgatar código".',
          "Cole a key e avance para finalizar.",
        ],
      },
    ],
  },
  {
    title: "Steam",
    logo: steamLogo,
    steps: [
      {
        heading: "No cliente Steam",
        items: [
          "Faça login na sua conta.",
          'Abra o menu "Jogos" e escolha "Ativar um produto no Steam".',
          "Aceite os termos, cole a key e conclua o processo.",
        ],
      },
    ],
  },
  {
    title: "Nintendo Switch",
    logo: nintendoLogo,
    steps: [
      {
        heading: "No console",
        items: [
          "Abra a Nintendo eShop no Switch.",
          "Selecione o usuário desejado.",
          'No menu lateral, clique em "Inserir código".',
          "Digite a key e confirme.",
        ],
      },
      {
        heading: "No site",
        items: [
          "Entre na sua conta Nintendo.",
          "Abra a área de resgate de código.",
          "Cole a key e confirme para liberar o jogo.",
        ],
      },
    ],
  },
];

export default function Platforms() {
  return (
    <section className="w-full bg-slate-950 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
          Plataformas
        </h2>
        <h1 className="mb-10 text-center text-3xl font-semibold text-white sm:mb-14 sm:text-5xl">
          Como resgatar em cada plataforma
        </h1>

        <div className="grid grid-cols-1 gap-5 lg:gap-6">
          {platformGuides.map((platform) => (
            <article
              key={platform.title}
              className="rounded-[30px] border border-slate-800 bg-slate-950/80 p-5 text-left shadow-[0_18px_45px_rgba(2,6,23,0.3)] sm:p-7"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
                  <img
                    src={platform.logo}
                    alt={`Logo ${platform.title}`}
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                  {platform.title}
                </h3>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {platform.steps.map((step) => (
                  <div
                    key={`${platform.title}-${step.heading}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5"
                  >
                    <h4 className="text-lg font-medium text-white">
                      {step.heading}
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                      {step.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
