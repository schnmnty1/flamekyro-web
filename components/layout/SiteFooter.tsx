import { BRAND } from "@/lib/constants";

/**
 * Compact site footer — copyright only.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/[0.055] pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="container-page flex justify-center py-4 text-center sm:py-5">
        <p className="text-[0.65rem] tracking-[0.08em] text-white/22">
          © {year} {BRAND.name}
        </p>
      </div>
    </footer>
  );
}
