import NavBar from "../components/globals/NavBar";
import Footer from "../components/globals/Footer";
import ProductCatalog from "../components/loja/ProductCatalog";
import ProductFilters from "../components/loja/ProductFilters";

function Loja() {
  return (
    <div className="nexus-page-shell nexus-motion-surface">
      <NavBar />
      <main id="conteudo-principal" className="mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <header className="mb-7 max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Explore a loja
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Compare jogos, plataformas, preços e disponibilidade antes de escolher sua próxima experiência.
          </p>
        </header>
        <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-7">
          <ProductFilters />
          <div className="min-w-0 flex-1">
            <ProductCatalog />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
export default Loja;
