"use client";

import { useEffect, useState } from "react";
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
 * Mobile (<768px) uses a lighter, cheaper bloom — desktop unchanged.
 */
export function ActiveCardGlow({ platform, lite }: ActiveCardGlowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme: PlatformCardTheme = PLATFORM_CARD_THEMES[platform.icon];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const soft = lite || prefersReducedMotion;
  const blur = soft ? (isMobile ? "blur(18px)" : "blur(32px)") : "blur(56px)";
  const opacity = soft ? (isMobile ? 0.42 : 0.6) : 0.92;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={platform.id}
          className="absolute h-[180px] w-[180px] rounded-full md:h-[380px] md:w-[380px] lg:h-[440px] lg:w-[440px]"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 68%)`,
            filter: blur,
            willChange: "opacity, transform",
            transform: "translateZ(0)",
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 0.9 }
              : { opacity: 0, scale: 0.9 }
          }
          animate={{ opacity, scale: 1 }}
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
