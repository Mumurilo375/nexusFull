import NavBar from "../components/globals/NavBar";
import Footer from "../components/globals/Footer";
import ProductCatalog from "../components/loja/ProductCatalog";
import ProductFilters from "../components/loja/ProductFilters";

function Loja() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-6 pb-10 pt-28 lg:px-2 xl:px-0">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
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
