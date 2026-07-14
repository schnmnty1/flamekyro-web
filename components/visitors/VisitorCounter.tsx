"use client";

import { useVisitorCount } from "@/hooks/useVisitorCount";

function formatVisitors(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

/**
 * Minimal website visitor band — real count from `/api/visitors`.
 */
export function VisitorCounter() {
  const { count, loading, error } = useVisitorCount();

  const display =
    typeof count === "number"
      ? formatVisitors(count)
      : loading
        ? "—"
        : error
          ? "—"
          : "—";

  return (
    <section
      aria-labelledby="visitor-counter-heading"
      className="section-band relative z-10 overflow-x-clip pb-4 pt-1 sm:pb-5"
    >
      <div className="container-page mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="glass-panel radius-panel panel-pad w-full max-w-[16rem]">
          <h2
            id="visitor-counter-heading"
            className="text-section text-[0.65rem] tracking-[0.22em] text-white/34 sm:text-[0.7rem]"
          >
            Website Visitors
          </h2>
          <p
            className="text-metric text-brand mt-1.5 text-lg font-semibold text-white/70 sm:text-xl"
            aria-live="polite"
          >
            {display}
          </p>
        </div>
      </div>
    </section>
  );
}
