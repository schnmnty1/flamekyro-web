"use client";

import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { SocialIcon } from "@/components/social/SocialIcon";
import {
  COVERFLOW_SPRING,
  PLATFORM_CARD_THEMES,
} from "@/components/social/cardThemes";
import { BRAND } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";
import type { SocialPlatform } from "@/types/social";

export type SocialCardProps = {
  platform: SocialPlatform;
  offset: number;
  isActive: boolean;
  visibleRange: number;
  onSelect: () => void;
  isCompact: boolean;
  /** Skip float / heavy filters on touch devices */
  liteEffects: boolean;
};

/**
 * Premium glass platform card — GPU transforms only for coverflow motion.
 */
export function SocialCard({
  platform,
  offset,
  isActive,
  visibleRange,
  onSelect,
  isCompact,
  liteEffects,
}: SocialCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = PLATFORM_CARD_THEMES[platform.icon];
  const [hovered, setHovered] = useState(false);

  const abs = Math.abs(offset);
  const hidden = abs > visibleRange;
  const isSide = abs === 1;
  const isBack = abs >= 2;

  const spacing = isCompact ? 100 : 160;
  const rotateY = offset * (isCompact ? -26 : -34);
  const scale = isActive ? 1 : isSide ? 0.9 : Math.max(0.82, 1 - abs * 0.09);
  const z = isActive ? 48 : -abs * (isCompact ? 80 : 120);
  const opacity = hidden
    ? 0
    : isActive
      ? 1
      : isSide
        ? 0.86
        : Math.max(0.75, 1 - abs * 0.12);
  const y = abs * (isCompact ? 6 : 10);

  // Pointer-driven specular (desktop only) — MotionValues, no re-renders
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(28);
  const glareXSpring = useSpring(glareX, { stiffness: 220, damping: 28 });
  const glareYSpring = useSpring(glareY, { stiffness: 220, damping: 28 });
  const glareBackground = useMotionTemplate`radial-gradient(420px circle at ${glareXSpring}% ${glareYSpring}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 28%, transparent 58%)`;

  const enableHoverFX = isActive && !liteEffects && !prefersReducedMotion;

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        zIndex: Math.round(120 - abs * 12),
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      {/* Soft contact shadow under the floating center card */}
      {isActive ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-[72%] left-1/2 h-6 w-[58%] -translate-x-1/2 rounded-[100%] sm:h-8 sm:w-[62%]"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.shadow} 0%, transparent 70%)`,
            filter: liteEffects ? "blur(8px)" : "blur(14px)",
          }}
          animate={
            prefersReducedMotion || liteEffects
              ? { opacity: 0.45, y: 0 }
              : { opacity: [0.35, 0.55, 0.35], y: [0, 2, 0] }
          }
          transition={
            prefersReducedMotion || liteEffects
              ? { duration: 0.3 }
              : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ) : null}

      <motion.a
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={isActive ? 0 : -1}
        aria-label={`Open ${platform.name} — ${BRAND.handle}`}
        aria-current={isActive ? "true" : undefined}
        onClick={(event) => {
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
        onHoverStart={() => {
          if (enableHoverFX) setHovered(true);
        }}
        onHoverEnd={() => {
          setHovered(false);
          glareX.set(50);
          glareY.set(28);
        }}
        onPointerMove={(event) => {
          if (!enableHoverFX) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - rect.left) / rect.width) * 100;
          const py = ((event.clientY - rect.top) / rect.height) * 100;
          glareX.set(px);
          glareY.set(py);
        }}
        className={cn(
          "relative block overflow-hidden will-change-transform",
          "h-[148px] w-[100px] sm:h-[174px] sm:w-[124px] lg:h-[184px] lg:w-[132px]",
          "rounded-[26px] border backdrop-blur-[24px] backdrop-saturate-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/65 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive ? "border-white/20" : "border-white/[0.08]",
        )}
        style={{
          transformStyle: "preserve-3d",
          background: theme.surface,
          filter:
            isBack && !liteEffects && !prefersReducedMotion
              ? "blur(1.2px)"
              : undefined,
          boxShadow: isActive
            ? [
                `0 32px 64px rgba(0,0,0,0.52)`,
                `0 0 48px ${theme.shadow}`,
                `inset 0 1px 0 rgba(255,255,255,0.24)`,
                `inset 0 -1px 0 rgba(255,255,255,0.05)`,
              ].join(", ")
            : [
                `0 20px 44px rgba(0,0,0,0.4)`,
                `inset 0 1px 0 rgba(255,255,255,0.13)`,
                `inset 0 -1px 0 rgba(255,255,255,0.03)`,
              ].join(", "),
        }}
        animate={{
          x: offset * spacing,
          y: isActive && hovered ? y - 8 : y,
          z: isActive && hovered ? z + 14 : z,
          rotateY,
          scale: isActive && hovered ? 1.025 : scale,
          opacity,
        }}
        transition={COVERFLOW_SPRING}
        whileTap={isActive ? { scale: 0.985 } : undefined}
      >
        {/* Platform wash */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: theme.wash, opacity: isActive ? 0.95 : 0.7 }}
        />

        {/* Dynamic specular (desktop active) */}
        {enableHoverFX ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background: glareBackground,
              opacity: hovered ? 0.9 : 0.45,
            }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 55%)",
            }}
          />
        )}

        {/* Top edge specular line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
        />

        {/* Bottom depth */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/45 via-black/10 to-transparent"
        />

        <motion.div
          className="relative flex h-full w-full flex-col items-center justify-center gap-2.5 px-3 sm:gap-3 sm:px-4"
          animate={
            isActive && !prefersReducedMotion && !liteEffects
              ? { y: [0, -4, 0] }
              : { y: 0 }
          }
          transition={
            isActive && !prefersReducedMotion && !liteEffects
              ? { duration: 5.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.28 }
          }
        >
          <span
            className={cn(
              "relative flex items-center justify-center rounded-[16px] border border-white/12 sm:rounded-[18px]",
              "h-11 w-11 sm:h-[3.25rem] sm:w-[3.25rem] lg:h-14 lg:w-14",
              "bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.25)]",
              isActive && "border-white/18",
            )}
            style={{
              color: theme.accent,
              boxShadow: isActive
                ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 28px ${theme.shadow}`
                : undefined,
            }}
          >
            <SocialIcon
              id={platform.icon}
              className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
            />
          </span>

          <div className="text-center">
            <p className="text-brand text-sm font-semibold tracking-[0.03em] text-white sm:text-base">
              {platform.name}
            </p>
            <p className="mt-0.5 text-[0.7rem] tracking-[0.02em] text-white/50 sm:mt-1 sm:text-xs">
              {BRAND.handle}
            </p>
          </div>
        </motion.div>
      </motion.a>
    </div>
  );
}
