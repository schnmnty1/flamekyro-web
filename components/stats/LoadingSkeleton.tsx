"use client";

import { cn } from "@/lib/cn";

type LoadingSkeletonProps = {
  className?: string;
  count?: number;
};

/**
 * Glass shimmer placeholders shown while the stats adapter resolves.
 */
export function LoadingSkeleton({
  className,
  count = 6,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="glass-panel rounded-2xl p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="mt-6 h-8 w-28 animate-pulse rounded-md bg-white/10" />
          <div className="mt-3 h-3 w-20 animate-pulse rounded bg-white/[0.07]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
        </div>
      ))}
      <span className="sr-only">Loading creator stats</span>
    </div>
  );
}
