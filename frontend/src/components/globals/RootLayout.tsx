import { Outlet } from "react-router-dom";
import RouteScrollToTop from "./RouteScrollToTop";

export default function RootLayout() {
  return (
    <>
      <a
        href="#conteudo-principal"
        className="fixed left-4 top-4 z-[200] -translate-y-20 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        Ir para o conteúdo
      </a>
      <RouteScrollToTop />
      <Outlet />
    </>
  );
}
