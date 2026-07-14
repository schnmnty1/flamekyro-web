"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { StatIcon } from "@/components/stats/StatIcon";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/cn";
import { formatStatNumber } from "@/lib/stats/format";
import { SPRING_SOFT } from "@/lib/motion";
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
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      className={cn(
        "glass-panel group relative overflow-hidden rounded-2xl p-5 sm:p-6",
        "transition-[box-shadow,transform] duration-300",
        "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]",
      )}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 0 transparent`,
      }}
    >
      {/* Accent wash */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${stat.accent}33, transparent 55%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
          style={{ color: stat.accent }}
        >
          <StatIcon id={stat.icon} className="h-5 w-5" />
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

      <div className="relative mt-5">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-brand text-2xl font-semibold tracking-tight text-white sm:text-3xl",
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

        <h3 className="mt-2 text-sm font-medium tracking-[0.02em] text-white/80">
          {stat.title}
        </h3>
        <p className="mt-1 text-xs tracking-[0.01em] text-white/40">
          {isError ? (stat.errorMessage ?? "Could not load") : stat.subtitle}
        </p>
      </div>
    </motion.article>
  );
}
