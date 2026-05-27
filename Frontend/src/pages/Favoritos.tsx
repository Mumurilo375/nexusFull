import NavBar from "../components/globals/NavBar";
import Footer from "../components/globals/Footer";
import Favorites from "../components/user/favorites/Favorites";

function Favoritos() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.1),transparent_30%),linear-gradient(180deg,#020617_0%,#030712_100%)]">
      <NavBar />
      <Favorites />
      <Footer />
    </div>
  );
}

export default Favoritos;
