import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      void navigate(-1);
      return;
    }

    void navigate("/");
  };

  return (
    <button
      type="button"
      className="mx-auto mt-8 flex w-fit items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-slate-900 hover:text-white"
      onClick={handleBack}
    >
      Voltar
    </button>
  );
}
