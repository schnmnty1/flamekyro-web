import { BRAND } from "@/lib/constants";

/**
 * Compact site footer — brand lockup only, no filler copy.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.055]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="container-page flex flex-col items-center gap-1 py-4 text-center sm:py-5">
        <p className="text-display text-xs uppercase tracking-[0.36em] text-white/50 sm:text-sm">
          {BRAND.name}
        </p>
        <p className="text-brand text-xs tracking-[0.06em] text-white/32">
          {BRAND.handle}
        </p>
      </div>
    </footer>
  );
}
