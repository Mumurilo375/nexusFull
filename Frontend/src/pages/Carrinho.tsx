import Footer from "../components/globals/Footer";
import NavBar from "../components/globals/NavBar";
import Cart from "../components/user/cart/Cart";

export default function Carrinho() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <Cart />
      <Footer />
    </div>
  );
}
