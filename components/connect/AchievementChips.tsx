"use client";

import { useAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/cn";

type AchievementChipsProps = {
  className?: string;
};

/**
 * Compact status pills — live YouTube metrics, value-dominant hierarchy.
 */
export function AchievementChips({ className }: AchievementChipsProps) {
  const { items } = useAchievements();

  if (items.length === 0) return null;

  return (
    <ul
      aria-label="Achievements"
      className={cn(
        "flex flex-wrap items-center justify-center gap-3.5 px-2.5 md:gap-2.5 md:px-4",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id}>
          <span
            className={cn(
              "glass-panel inline-flex items-center gap-1 rounded-[13px] px-2.5 py-1.5 md:gap-2 md:px-3.5",
            )}
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[14px] leading-none sm:h-4 sm:w-4 sm:text-[15px]"
              aria-hidden
            >
              {item.icon}
            </span>
            <span className="flex flex-col items-start justify-center text-left leading-none">
              <span className="text-metric text-brand text-[0.875rem] font-semibold tracking-[-0.015em] text-white sm:text-[0.9375rem]">
                {item.value}
              </span>
              <span className="mt-0.5 text-[0.55rem] font-medium tracking-[0.08em] text-white/32 uppercase sm:text-[0.575rem]">
                {item.label}
              </span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
