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
        "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03] shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <div className="relative aspect-video animate-pulse bg-white/[0.06]">
            <div className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
            <div className="absolute right-3 bottom-3 h-5 w-12 rounded-md bg-white/10" />
          </div>
          <div className="border-t border-white/[0.06] bg-white/[0.04] px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-5">
            <div className="h-4 w-[85%] animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-[60%] animate-pulse rounded bg-white/[0.07]" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading latest videos</span>
    </div>
  );
}
