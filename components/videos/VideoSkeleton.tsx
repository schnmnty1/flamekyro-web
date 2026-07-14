"use client";

import { cn } from "@/lib/cn";

type VideoSkeletonProps = {
  className?: string;
  count?: number;
};

/**
 * Premium card-shaped placeholders — same footprint as VideoCard.
 */
export function VideoSkeleton({ className, count = 3 }: VideoSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.028] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_18px_40px_rgba(0,0,0,0.38)]"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="relative aspect-[16/6.75] skeleton-shimmer">
            <div className="absolute top-1/2 left-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.08]" />
            <div className="absolute right-2.5 bottom-2.5 h-5 w-12 rounded-md bg-white/10" />
          </div>
          <div className="border-t border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent px-3.5 py-2.5 sm:px-4 sm:py-3">
            <div className="h-3.5 w-[85%] rounded skeleton-shimmer" />
            <div className="mt-2 h-3 w-[58%] rounded skeleton-shimmer" />
            <div className="mt-2 h-2.5 w-24 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading latest videos</span>
    </div>
  );
}
