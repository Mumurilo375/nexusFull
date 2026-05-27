import { Outlet } from "react-router-dom";
import RouteScrollToTop from "./RouteScrollToTop";

export default function RootLayout() {
  return (
    <>
      <RouteScrollToTop />
      <Outlet />
    </>
  );
}
