"use client";

import { motion } from "framer-motion";
import { useSpatialLayer } from "@/components/spatial";
import { useYouTubeLive } from "@/hooks/useYouTubeLive";
import { usePrefersReducedMotion } from "@/hooks";
import { BRAND } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Cinematic hero — brand-first, compact vertical footprint for near single-screen.
 * Live badge reflects real YouTube Live status.
 */
export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const layer = useSpatialLayer({
    rotate: prefersReducedMotion ? 0 : 2,
    translate: prefersReducedMotion ? 0 : 10,
  });
  const { isLive, statusLabel, liveTitle } = useYouTubeLive();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-20 flex items-end justify-center px-5 pb-2 pt-[max(2.25rem,calc(env(safe-area-inset-top)+1.75rem))] sm:px-8 sm:pb-2.5 sm:pt-[max(2.75rem,calc(env(safe-area-inset-top)+2.25rem))] lg:pb-3"
      style={{ perspective: 1200 }}
    >
      <motion.div
        variants={prefersReducedMotion ? undefined : heroContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        style={{
          rotateX: layer.rotateX,
          rotateY: layer.rotateY,
          x: layer.x,
          y: layer.y,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="flex w-full max-w-5xl flex-col items-center text-center will-change-transform"
      >
        <motion.p
          variants={prefersReducedMotion ? undefined : heroItem}
          className="text-brand mb-1.5 max-w-md text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/42 sm:mb-2 sm:text-xs sm:tracking-[0.36em]"
        >
          {BRAND.eyebrow}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={prefersReducedMotion ? undefined : heroHeading}
          className="text-display hero-glow max-w-full text-[clamp(2.35rem,8.5vw,4.75rem)] leading-[0.9] text-white"
          style={{ transform: "translateZ(28px)" }}
        >
          {BRAND.name}
        </motion.h1>

        <motion.div
          variants={prefersReducedMotion ? undefined : heroItem}
          className="mt-3 flex flex-col items-center gap-1"
          style={{ transform: "translateZ(16px)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              {isLive ? (
                <>
                  {!prefersReducedMotion ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/50 opacity-50" />
                  ) : null}
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                </>
              ) : (
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/35 ring-1 ring-white/20" />
              )}
            </span>
            <p
              className={cn(
                "text-sm font-medium tracking-[0.06em] sm:text-[0.95rem]",
                isLive ? "text-emerald-400/92" : "text-white/55",
              )}
            >
              <span className="sr-only">Live status: </span>
              {statusLabel}
            </p>
          </div>
          {isLive && liveTitle ? (
            <p className="text-brand max-w-xl line-clamp-1 px-4 text-xs tracking-[0.02em] text-white/45 sm:text-sm">
              {liveTitle}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
