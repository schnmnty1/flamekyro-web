"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui";
import { useSpatialLayer } from "@/components/spatial";
import { useYouTubeLive } from "@/hooks/useYouTubeLive";
import { BRAND } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";

/**
 * Cinematic hero — brand-first, compact vertical footprint for near single-screen.
 * Live badge + Watch Live wired to real YouTube Live status.
 */
export function Hero() {
  const layer = useSpatialLayer({ rotate: 2, translate: 10 });
  const { isLive, statusLabel, liveTitle, watchUrl } = useYouTubeLive();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-20 flex items-end justify-center px-5 pb-1 pt-[4.5rem] sm:px-8 sm:pb-1 sm:pt-[4.9rem] lg:pb-1.5"
      style={{ perspective: 1200 }}
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
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
          variants={heroItem}
          className="text-brand mb-1.5 max-w-md text-[0.65rem] font-medium uppercase tracking-[0.32em] text-white/40 sm:mb-2 sm:text-xs sm:tracking-[0.36em]"
        >
          {BRAND.eyebrow}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={heroHeading}
          className="text-display hero-glow max-w-full text-[clamp(2.25rem,8.5vw,4.75rem)] leading-[0.9] text-white"
          style={{ transform: "translateZ(28px)" }}
        >
          {BRAND.name}
        </motion.h1>

        <motion.div
          variants={heroItem}
          className="mt-2 flex flex-col items-center gap-1 sm:mt-2.5"
          style={{ transform: "translateZ(16px)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/50 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
            </span>
            <p className="text-sm font-medium tracking-[0.06em] text-emerald-400/92 sm:text-[0.95rem]">
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

        <motion.div
          variants={heroItem}
          className="mt-2 sm:mt-2.5"
          style={{ transform: "translateZ(20px)" }}
        >
          <GlassButton
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              isLive
                ? `Watch ${BRAND.name} live on YouTube`
                : `Open ${BRAND.name} on YouTube`
            }
            className="min-h-10 px-7 text-sm tracking-[0.14em] uppercase sm:min-h-11 sm:px-9 sm:text-[0.95rem]"
          >
            Watch Live
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
