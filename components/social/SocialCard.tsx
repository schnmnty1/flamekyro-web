"use client";

import { motion } from "framer-motion";
import { SocialIcon } from "@/components/social/SocialIcon";
import { cn } from "@/lib/cn";
import { CAROUSEL_SPRING } from "@/lib/motion";
import type { SocialPlatform } from "@/types/social";

export type SocialCardProps = {
  platform: SocialPlatform;
  /** Circular offset from active card (−n/2 … n/2) */
  offset: number;
  isActive: boolean;
  /** Max |offset| still rendered in the 3D stage */
  visibleRange: number;
  onSelect: () => void;
  /** Desktop vs mobile spacing / scale */
  isCompact: boolean;
};

/**
 * Single glass social card positioned in 3D coverflow space.
 * Outer shell handles centering; motion layer owns 3D transforms only.
 */
export function SocialCard({
  platform,
  offset,
  isActive,
  visibleRange,
  onSelect,
  isCompact,
}: SocialCardProps) {
  const abs = Math.abs(offset);
  const hidden = abs > visibleRange;

  const spacing = isCompact ? 118 : 210;
  const rotateY = offset * (isCompact ? -28 : -38);
  const scale = isActive ? 1 : Math.max(0.72, 1 - abs * 0.14);
  const z = -abs * (isCompact ? 90 : 140);
  const opacity = hidden ? 0 : Math.max(0.35, 1 - abs * 0.28);
  const y = abs * (isCompact ? 6 : 10);

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        zIndex: Math.round(100 - abs * 10),
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <motion.a
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={isActive ? 0 : -1}
        aria-label={`Open ${platform.name} — ${platform.handle}`}
        aria-current={isActive ? "true" : undefined}
        onClick={(event) => {
          // Side cards rotate into focus first; only the active card navigates.
          if (!isActive) {
            event.preventDefault();
            onSelect();
          }
        }}
        onKeyDown={(event) => {
          if (!isActive && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-3xl",
          "h-[220px] w-[150px] sm:h-[280px] sm:w-[200px] lg:h-[320px] lg:w-[230px]",
          "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive && "border-white/20",
        )}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isActive
            ? `0 0 36px ${platform.accent}55, 0 0 80px ${platform.accent}22, inset 0 1px 0 rgba(255,255,255,0.12)`
            : "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        animate={{
          x: offset * spacing,
          y,
          z,
          rotateY,
          scale,
          opacity,
        }}
        transition={CAROUSEL_SPRING}
        whileHover={isActive ? { scale: scale * 1.03 } : undefined}
        whileTap={isActive ? { scale: scale * 0.98 } : undefined}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${platform.accent}33, transparent 60%)`,
          }}
        />

        <span
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] sm:h-16 sm:w-16",
            isActive && "shadow-[0_0_24px_rgba(0,245,255,0.15)]",
          )}
          style={{ color: platform.accent }}
        >
          <SocialIcon id={platform.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>

        <div className="relative px-4 text-center">
          <p className="text-brand text-base font-semibold tracking-wide text-white sm:text-lg">
            {platform.name}
          </p>
          <p className="mt-1 text-xs text-white/50 sm:text-sm">
            {platform.handle}
          </p>
        </div>
      </motion.a>
    </div>
  );
}
