import Footer from "../components/globals/Footer";
import Hero from "../components/comofunciona/Hero";
import FrequentlyAskedQuestions from "../components/comofunciona/FrequentlyAskedQuestions";
import Platforms from "../components/comofunciona/Platforms";
import Steps from "../components/comofunciona/Steps";
import NavBar from "../components/globals/NavBar";

function ComoFunciona() {
  return (
    <div className="bg-slate-950">
      <NavBar />
      <Hero />
      <Steps />
      <Platforms />
      <FrequentlyAskedQuestions />
      <Footer />
    </div>
  );
}
export default ComoFunciona;
