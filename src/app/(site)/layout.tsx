import { type ReactNode } from "react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { SiteSplash } from "@/components/site/splash";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteSplash />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
