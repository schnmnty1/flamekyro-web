import { cn } from "@/lib/cn";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import type { PageLayoutProps } from "@/types";

/**
 * Global page shell — Navbar + main content + footer.
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("relative flex min-h-dvh flex-col", className)}>
      <Navbar />
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
