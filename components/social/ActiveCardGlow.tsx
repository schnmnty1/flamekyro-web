"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PLATFORM_CARD_THEMES,
  type PlatformCardTheme,
} from "@/components/social/cardThemes";
import { usePrefersReducedMotion } from "@/hooks";
import type { SocialPlatform } from "@/types/social";

type ActiveCardGlowProps = {
  platform: SocialPlatform;
  /** Reduce blur/intensity on touch / reduced-motion */
  lite: boolean;
};

/**
 * Soft colored bloom behind the active card only.
 * Color crossfades when the active platform changes.
 */
export function ActiveCardGlow({ platform, lite }: ActiveCardGlowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme: PlatformCardTheme = PLATFORM_CARD_THEMES[platform.icon];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={platform.id}
          className="absolute h-[280px] w-[280px] rounded-full sm:h-[380px] sm:w-[380px] lg:h-[440px] lg:w-[440px]"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 68%)`,
            filter: lite || prefersReducedMotion ? "blur(32px)" : "blur(56px)",
            willChange: "opacity, transform",
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 0.9 }
              : { opacity: 0, scale: 0.9 }
          }
          animate={{ opacity: lite ? 0.6 : 0.92, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.06 }
          }
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </div>
  );
}
