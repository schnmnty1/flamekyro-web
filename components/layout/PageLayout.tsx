import { cn } from "@/lib/cn";
import { Navbar } from "./Navbar";
import type { PageLayoutProps } from "@/types";

/**
 * Global page shell — Navbar + main content region.
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("relative flex min-h-dvh flex-col", className)}>
      <Navbar />
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
    </div>
  );
}
