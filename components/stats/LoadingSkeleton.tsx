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
        "grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:gap-3.5",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="glass-panel rounded-2xl p-3.5 sm:p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-8 w-8 rounded-lg skeleton-shimmer sm:h-9 sm:w-9" />
          </div>
          <div className="mt-3 h-6 w-24 rounded-md skeleton-shimmer sm:mt-3.5" />
          <div className="mt-2 h-3 w-16 rounded skeleton-shimmer" />
          <div className="mt-1.5 h-2.5 w-20 rounded skeleton-shimmer" />
        </div>
      ))}
      <span className="sr-only">Loading creator stats</span>
    </div>
  );
}
