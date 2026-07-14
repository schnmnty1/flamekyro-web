"use client";

import { cn } from "@/lib/cn";
import type { SocialPlatform } from "@/types/social";

type CarouselPaginationProps = {
  platforms: readonly SocialPlatform[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function CarouselPagination({
  platforms,
  activeIndex,
  onSelect,
}: CarouselPaginationProps) {
  return (
    <div
      role="tablist"
      aria-label="Social platforms"
      className="flex items-center justify-center gap-2.5"
    >
      {platforms.map((platform, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={platform.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Show ${platform.name}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "w-7" : "w-2 bg-white/25 hover:bg-white/40",
            )}
            style={
              isActive
                ? {
                    backgroundColor: platform.accent,
                    boxShadow: `0 0 12px ${platform.accent}88`,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
