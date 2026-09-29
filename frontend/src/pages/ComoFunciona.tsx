import Hero from "../components/comofunciona/Hero";
import FrequentlyAskedQuestions from "../components/comofunciona/FrequentlyAskedQuestions";
import Platforms from "../components/comofunciona/Platforms";
import Steps from "../components/comofunciona/Steps";
import SiteLayout from "../components/globals/SiteLayout";

function ComoFunciona() {
  return (
    <SiteLayout className="bg-slate-950">
      <Hero />
      <Steps />
      <Platforms />
      <FrequentlyAskedQuestions />
    </SiteLayout>
  );
}
export default ComoFunciona;
