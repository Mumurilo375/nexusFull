import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <img
          src="/utils/residenthero.jpg"
          alt="Resident Evil Requiem"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.14)_0%,rgba(2,6,23,0.22)_32%,rgba(2,6,23,0.78)_100%)]" />
      </div>

      <div className="relative z-20 flex h-full items-center justify-end px-4 sm:px-8 lg:px-14">
        <div className="w-full max-w-140 rounded-[28px] border border-white/10 bg-slate-950/66 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.24)] sm:p-5">
          <div className="overflow-hidden rounded-xl">
            <iframe
              className="aspect-video w-full"
              src="https://www.youtube.com/embed/RJ7eRQgJBbo"
              title="Trailer de Resident Evil Requiem"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-200 sm:text-base">
            Resident Evil Requiem é um survival horror que mistura terror e
            ação, focado em uma nova investigação ligada ao desastre de Raccoon
            City.
          </p>

          <Link
            to="/loja/2"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:text-base"
          >
            Comprar agora
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
