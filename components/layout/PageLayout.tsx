import { cn } from "@/lib/cn";
import { SiteFooter } from "./SiteFooter";
import type { PageLayoutProps } from "@/types";

/**
 * Global page shell — main content + footer (no top chrome).
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("relative flex min-h-dvh flex-col", className)}>
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[100] -translate-y-[160%] rounded-full border border-white/20 bg-surface px-4 py-2.5 text-sm font-medium text-white opacity-0 shadow-[0_0_24px_rgba(0,245,255,0.2)] outline-none transition-none focus:translate-y-0 focus:opacity-100 focus:ring-2 focus:ring-glow/55"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex flex-1 flex-col outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
