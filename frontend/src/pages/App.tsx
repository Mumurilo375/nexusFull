import Hero from "../components/globals/Hero";
import Highlights from "../components/globals/Highlights";
import HomeShowcase from "../components/globals/HomeShowcase";
import Platforms from "../components/globals/Platforms";
import SiteLayout from "../components/globals/SiteLayout";

function App() {
  return (
    <SiteLayout className="nexus-page-shell nexus-motion-surface">
      <main id="conteudo-principal">
        <Hero />
        <HomeShowcase />
        <Highlights />
        <Platforms />
      </main>
    </SiteLayout>
  );
}

export default App;
