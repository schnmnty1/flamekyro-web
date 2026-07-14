"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSpatialLayer } from "@/components/spatial";
import { useYouTubeLive } from "@/hooks/useYouTubeLive";
import { usePrefersReducedMotion } from "@/hooks";
import { BRAND } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

const STATUS_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Cinematic hero — brand-first, stream status only (no tagline clutter).
 * Live status from existing `/api/youtube` (shared fetch, no extra polling).
 */
export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const layer = useSpatialLayer({
    rotate: prefersReducedMotion ? 0 : 2,
    translate: prefersReducedMotion ? 0 : 10,
  });
  const { isLive, statusLabel, liveTitle } = useYouTubeLive();

  const fadeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

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
          className="mt-3 flex w-full max-w-xl flex-col items-center"
          style={{ transform: "translateZ(16px)" }}
        >
          <div className="relative flex min-h-[2.75rem] w-full flex-col items-center sm:min-h-[3.25rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isLive ? "live" : "offline"}
                className="absolute inset-x-0 top-0 flex flex-col items-center"
                initial={STATUS_FADE.initial}
                animate={STATUS_FADE.animate}
                exit={STATUS_FADE.exit}
                transition={fadeTransition}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex h-2 w-2 rounded-full",
                      isLive
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
                        : "bg-white/45 ring-1 ring-white/25",
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      "text-sm font-medium tracking-[0.08em] uppercase sm:text-[0.95rem]",
                      isLive ? "text-emerald-400/90" : "text-white/50",
                    )}
                  >
                    <span className="sr-only">Stream status: </span>
                    {statusLabel}
                  </p>
                </div>

                <p
                  className={cn(
                    "text-brand mt-1.5 line-clamp-1 max-w-xl px-4 text-xs tracking-[0.02em] sm:text-sm",
                    isLive && liveTitle ? "text-white/45" : "invisible",
                  )}
                  aria-hidden={!isLive || !liveTitle}
                >
                  {liveTitle ?? "\u00A0"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
