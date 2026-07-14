"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui";
import { BRAND, LINKS } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";

/**
 * Cinematic hero — brand-first, compact vertical footprint.
 * Sized so the social carousel peeks into the first viewport on 1080p.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex items-end justify-center px-5 pb-6 pt-[7.5rem] sm:px-8 sm:pb-8 sm:pt-32 lg:pb-10"
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-5xl flex-col items-center text-center"
      >
        {/* Eyebrow */}
        <motion.p
          variants={heroItem}
          className="text-brand mb-4 max-w-md text-[0.65rem] font-medium uppercase tracking-[0.28em] text-white/45 sm:mb-5 sm:text-xs sm:tracking-[0.32em]"
        >
          {BRAND.eyebrow}
        </motion.p>

        {/* Brand mark — hero-level (size intentionally unchanged) */}
        <motion.h1
          id="hero-heading"
          variants={heroHeading}
          className="text-display hero-glow max-w-full text-[clamp(2.75rem,12vw,8.5rem)] leading-[0.95] text-white"
        >
          {BRAND.name}
        </motion.h1>

        {/* Live status */}
        <motion.div
          variants={heroItem}
          className="mt-5 flex items-center gap-2.5 sm:mt-6"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <p className="text-sm font-medium tracking-wide text-emerald-400 sm:text-base">
            <span className="sr-only">Live status: </span>
            {BRAND.liveLabel}
          </p>
        </motion.div>

        {/* Primary CTA */}
        <motion.div variants={heroItem} className="mt-5 sm:mt-6">
          <GlassButton
            href={LINKS.watchLive}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch FLAMEKYRO live"
            className="min-h-12 px-8 text-sm tracking-[0.12em] uppercase sm:px-10 sm:text-base"
          >
            Watch Live
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
