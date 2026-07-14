"use client";

import { PLATFORM_CARD_THEMES } from "@/components/social/cardThemes";
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
        const theme = PLATFORM_CARD_THEMES[platform.icon];
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
              "h-2 rounded-full transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "w-8" : "w-2 bg-white/22 hover:bg-white/40",
            )}
            style={
              isActive
                ? {
                    backgroundColor: theme.accent === "#FFFFFF" ? theme.glow : theme.accent,
                    boxShadow: `0 0 12px ${theme.glow}, 0 0 28px ${theme.shadow}`,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
