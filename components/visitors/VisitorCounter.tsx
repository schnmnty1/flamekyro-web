"use client";

import { StatOdometer } from "@/components/stats/StatOdometer";
import { useVisitorCount } from "@/hooks/useVisitorCount";
import { formatVisitorCount } from "@/lib/stats/format";

/**
 * Minimal visitor band — odometer metric, exact under 1K, compact K+ at 1K+.
 */
export function VisitorCounter() {
  const { count, loading, error } = useVisitorCount();

  const display =
    typeof count === "number"
      ? formatVisitorCount(count)
      : loading || error
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
            Visitors
          </h2>
          <div
            className="text-metric text-brand mt-1.5 text-lg font-semibold text-white/70 sm:text-xl"
            aria-live="polite"
          >
            <StatOdometer value={display} />
          </div>
        </div>
      </div>
    </section>
  );
}
