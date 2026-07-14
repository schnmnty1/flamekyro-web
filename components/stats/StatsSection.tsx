"use client";

import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/stats/LoadingSkeleton";
import { StatCard } from "@/components/stats/StatCard";
import { GlassButton } from "@/components/ui";
import { STAT_CARD_DEFINITIONS, STATS_SECTION } from "@/data/stats";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

const sectionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/**
 * Creator Stats — adapter-driven metric grid with silent live refresh.
 */
export function StatsSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { stats, loading, error, source, reload } = useCreatorStats();

  const showLiveGrid = source === "live" && stats.length > 0;
  const showError = Boolean(error) && !showLiveGrid && !loading;
  const showConnecting = loading && !showLiveGrid;

  return (
    <section
      aria-labelledby="stats-heading"
      aria-describedby={
        showError || showConnecting ? "stats-status" : undefined
      }
      className="section-band section-rule relative z-10 overflow-x-clip pb-6 sm:pb-7"
    >
      <motion.div
        className="container-page"
        variants={prefersReducedMotion ? undefined : sectionContainer}
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.12 }}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mx-auto mb-3 max-w-2xl text-center sm:mb-3.5"
        >
          <h2 id="stats-heading" className="text-section">
            {STATS_SECTION.heading}
          </h2>
        </motion.div>

        {showLiveGrid ? (
          <motion.div
            variants={prefersReducedMotion ? undefined : sectionContainer}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:gap-3.5"
          >
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </motion.div>
        ) : showError ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <p
              id="stats-status"
              className="text-center text-sm tracking-[0.04em] text-white/45"
              role="alert"
            >
              {error ?? STATS_SECTION.errorLabel}
            </p>
            <GlassButton
              type="button"
              onClick={() => void reload()}
              className="min-h-10 px-6 text-sm tracking-[0.1em] uppercase"
            >
              Try Again
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-3">
            <p
              id="stats-status"
              className="text-center text-sm tracking-[0.04em] text-white/40"
              role="status"
              aria-live="polite"
            >
              {STATS_SECTION.connectingLabel}
            </p>
            <LoadingSkeleton count={STAT_CARD_DEFINITIONS.length} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
