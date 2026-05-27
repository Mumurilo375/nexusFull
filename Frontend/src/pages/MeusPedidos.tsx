import Footer from "../components/globals/Footer";
import NavBar from "../components/globals/NavBar";
import OrderLibrary from "../components/user/orders/OrderLibrary";

export default function MeusPedidos() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <OrderLibrary />
      <Footer />
    </div>
  );
}
