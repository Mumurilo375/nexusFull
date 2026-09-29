import type { ReactNode } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";

type SiteLayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function SiteLayout({ children, className = "nexus-page-shell" }: SiteLayoutProps) {
  return (
    <div className={className}>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}
