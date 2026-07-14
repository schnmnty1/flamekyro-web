import Link from "next/link";
import { BRAND } from "@/lib/constants";

/**
 * 404 — brand-consistent empty state.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-brand mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
        {BRAND.name}
      </p>
      <h1 className="text-display text-3xl text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="text-brand mt-3 max-w-md text-sm tracking-[0.02em] text-white/45">
        That route doesn&apos;t exist. Head back to the home page.
      </p>
      <Link
        href="/"
        className="glass-control mt-8 inline-flex min-h-10 items-center justify-center rounded-full px-7 text-sm font-medium tracking-[0.12em] text-white/90 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back Home
      </Link>
    </div>
  );
}
