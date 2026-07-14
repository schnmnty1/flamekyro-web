"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { StatIcon } from "@/components/stats/StatIcon";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/cn";
import { formatStatNumber } from "@/lib/stats/format";
import { SPRING_LIFT, SPRING_SOFT } from "@/lib/motion";
import type { StatCardModel } from "@/types/stats";

type StatCardProps = {
  stat: StatCardModel;
  /** Force loading UI for this card */
  loading?: boolean;
};

/**
 * Data-driven glass metric card — never owns hardcoded values.
 */
export function StatCard({ stat, loading = false }: StatCardProps) {
  const isLoading = loading || stat.status === "loading";
  const isError = stat.status === "error";
  const isLive = stat.status === "live";

  const shouldAnimate =
    !isLoading &&
    !isError &&
    stat.animateValue !== false &&
    typeof stat.value === "number";

  const counted = useCountUp({
    value: typeof stat.value === "number" ? stat.value : 0,
    enabled: shouldAnimate,
  });

  const display =
    isError
      ? (stat.errorMessage ?? "—")
      : isLoading
        ? "—"
        : stat.displayValue ??
          (typeof stat.value === "number"
            ? `${stat.valuePrefix ?? ""}${formatStatNumber(counted)}${stat.valueSuffix ?? ""}`
            : "—");

  const TrendIcon =
    stat.trend?.direction === "up"
      ? ArrowUpRight
      : stat.trend?.direction === "down"
        ? ArrowDownRight
        : ArrowRight;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      whileHover={{ y: -4, transition: SPRING_LIFT }}
      className={cn(
        "glass-panel group relative overflow-hidden rounded-2xl p-3.5 sm:p-4",
        "border-white/[0.08] transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-white/[0.14]",
        "hover:shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_22px_48px_rgba(0,0,0,0.42),0_0_36px_rgba(0,245,255,0.05)]",
      )}
    >
      {/* Accent wash */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-300 group-hover:opacity-85"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 0% 0%, ${stat.accent}38, transparent 58%)`,
        }}
      />

      {/* Top specular */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.22)] sm:h-9 sm:w-9 sm:rounded-xl"
          style={{ color: stat.accent }}
        >
          <StatIcon id={stat.icon} className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" />
        </span>

        {stat.trend && !isLoading ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.65rem] tracking-wide",
              stat.trend.direction === "up" && "text-emerald-400/90",
              stat.trend.direction === "down" && "text-red-400/90",
              stat.trend.direction === "flat" && "text-white/50",
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden />
            {stat.trend.label}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 sm:mt-3.5">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-brand text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl",
              isLive && "text-emerald-400",
              isError && "text-white/50",
            )}
          >
            {display}
          </p>
          {isLive ? (
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          ) : null}
        </div>

        <h3 className="mt-1.5 text-sm font-medium tracking-[0.03em] text-white/78">
          {stat.title}
        </h3>
        <p className="mt-0.5 text-xs tracking-[0.02em] text-white/38">
          {isError ? (stat.errorMessage ?? "Could not load") : stat.subtitle}
        </p>
      </div>
    </motion.article>
  );
}
