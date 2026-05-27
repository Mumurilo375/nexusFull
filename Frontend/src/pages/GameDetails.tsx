import Footer from "../components/globals/Footer";
import NavBar from "../components/globals/NavBar";
import ProductDetails from "../components/loja/ProductDetails";
import Rating from "../components/loja/Rating";

export default function GameDetails() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <ProductDetails />
      <Rating />
      <Footer />
    </div>
  );
}
