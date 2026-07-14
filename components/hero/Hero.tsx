"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui";
import { useSpatialLayer } from "@/components/spatial";
import { BRAND, LINKS } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";

/**
 * Cinematic hero — brand-first, compact vertical footprint.
 * Subtle pointer tilt (≤2°) on fine-pointer devices only.
 */
export function Hero() {
  const layer = useSpatialLayer({ rotate: 2, translate: 10 });

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-20 flex items-end justify-center px-5 pb-6 pt-[7.5rem] sm:px-8 sm:pb-8 sm:pt-32 lg:pb-10"
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
          className="text-brand mb-4 max-w-md text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white/42 sm:mb-5 sm:text-xs sm:tracking-[0.34em]"
        >
          {BRAND.eyebrow}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={heroHeading}
          className="text-display hero-glow max-w-full text-[clamp(2.75rem,12vw,8.5rem)] leading-[0.92] text-white"
          style={{ transform: "translateZ(28px)" }}
        >
          {BRAND.name}
        </motion.h1>

        <motion.div
          variants={heroItem}
          className="mt-5 flex items-center gap-2.5 sm:mt-6"
          style={{ transform: "translateZ(16px)" }}
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/55 opacity-55" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.55)]" />
          </span>
          <p className="text-sm font-medium tracking-[0.04em] text-emerald-400/95 sm:text-base">
            <span className="sr-only">Live status: </span>
            {BRAND.liveLabel}
          </p>
        </motion.div>

        <motion.div
          variants={heroItem}
          className="mt-5 sm:mt-6"
          style={{ transform: "translateZ(20px)" }}
        >
          <GlassButton
            href={LINKS.watchLive}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch FlameKyro live"
            className="min-h-12 px-8 text-sm tracking-[0.14em] uppercase sm:px-10 sm:text-[0.95rem]"
          >
            Watch Live
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
