import SiteLayout from "../components/globals/SiteLayout";
import Favorites from "../components/user/favorites/Favorites";

function Favoritos() {
  return (
    <SiteLayout className="bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.1),transparent_30%),linear-gradient(180deg,#020617_0%,#030712_100%)]">
      <Favorites />
    </SiteLayout>
  );
}

export default Favoritos;
