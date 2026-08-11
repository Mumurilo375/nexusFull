import Footer from "../components/globals/Footer";
import Hero from "../components/globals/Hero";
import Highlights from "../components/globals/Highlights";
import Intro from "../components/globals/Intro";
import NavBar from "../components/globals/NavBar";
import Platforms from "../components/globals/Platforms";

function App() {
  return (
    <div className="nexus-page-shell nexus-motion-surface">
      <NavBar />
      <main id="conteudo-principal">
        <Hero />
        <Intro />
        <Highlights />
        <Platforms />
      </main>
      <Footer />
    </div>
  );
}

export default App;
