"use client";

import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/stats/LoadingSkeleton";
import { StatCard } from "@/components/stats/StatCard";
import { STAT_CARD_DEFINITIONS, STATS_SECTION } from "@/data/stats";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

const sectionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/**
 * Creator Stats — adapter-driven metric grid.
 * Renders skeletons while source is pending (no fabricated numbers).
 */
export function StatsSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { stats, loading, error, source } = useCreatorStats();

  const showLiveGrid = !loading && !error && source === "live" && stats.length > 0;
  const statusLabel = error
    ? STATS_SECTION.errorLabel
    : STATS_SECTION.connectingLabel;

  return (
    <section
      aria-labelledby="stats-heading"
      className="relative z-10 overflow-x-clip pb-20 pt-6 sm:pb-28 sm:pt-10"
    >
      <motion.div
        className="container-page"
        variants={prefersReducedMotion ? undefined : sectionContainer}
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        >
          <h2
            id="stats-heading"
            className="text-display text-sm uppercase tracking-[0.38em] text-white/48 sm:text-base"
          >
            {STATS_SECTION.heading}
          </h2>
          <p className="text-brand mt-3 text-sm tracking-[0.01em] text-white/45 sm:text-base">
            {STATS_SECTION.subtitle}
          </p>
        </motion.div>

        {showLiveGrid ? (
          <motion.div
            variants={prefersReducedMotion ? undefined : sectionContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p
              className="text-center text-sm tracking-[0.04em] text-white/40"
              role="status"
              aria-live="polite"
            >
              {statusLabel}
            </p>
            <LoadingSkeleton count={STAT_CARD_DEFINITIONS.length} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
