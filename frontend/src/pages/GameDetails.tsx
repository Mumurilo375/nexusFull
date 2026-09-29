import SiteLayout from "../components/globals/SiteLayout";
import ProductDetails from "../components/loja/ProductDetails";
import Rating from "../components/loja/Rating";

export default function GameDetails() {
  return (
    <SiteLayout>
      <ProductDetails />
      <Rating />
    </SiteLayout>
  );
}
