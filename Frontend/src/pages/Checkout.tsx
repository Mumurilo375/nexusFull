import Footer from "../components/globals/Footer";
import NavBar from "../components/globals/NavBar";
import Checkout from "../components/user/checkout/Checkout";

export default function CheckoutPage() {
  return (
    <div className="nexus-page-shell">
      <NavBar />
      <Checkout />
      <Footer />
    </div>
  );
}
