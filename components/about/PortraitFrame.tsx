"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

/**
 * Futuristic gamer silhouette inside a premium portrait frame.
 * Placeholder art — swap for a real portrait later without changing layout.
 */
export function PortraitFrame() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:mx-0 lg:max-w-none"
    >
      {/* Outer glow ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-glow/[0.08] blur-2xl"
      />

      <motion.div
        className="glass-panel relative aspect-[4/5] overflow-hidden rounded-[1.65rem] will-change-transform"
        animate={
          prefersReducedMotion
            ? undefined
            : { y: [0, -8, 0] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Frame edge light */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/12"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-glow/50 to-transparent"
        />

        {/* Atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,245,255,0.14),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.18),transparent_50%),linear-gradient(180deg,#0b1220_0%,#050816_100%)]"
        />

        {/* Silhouette */}
        <svg
          viewBox="0 0 320 400"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Futuristic gamer silhouette placeholder"
        >
          <defs>
            <linearGradient id="sil-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="55%" stopColor="rgba(140,160,190,0.16)" />
              <stop offset="100%" stopColor="rgba(0,245,255,0.08)" />
            </linearGradient>
            <linearGradient id="sil-visor" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,245,255,0.15)" />
              <stop offset="50%" stopColor="rgba(0,245,255,0.65)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.35)" />
            </linearGradient>
            <filter id="sil-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shoulders / hoodie */}
          <path
            fill="url(#sil-body)"
            d="M48 392c18-78 42-128 72-148 12-8 28-12 40-12h0c12 0 28 4 40 12 30 20 54 70 72 148H48Z"
          />
          {/* Neck */}
          <path
            fill="url(#sil-body)"
            d="M138 210c6-10 14-16 22-16s16 6 22 16c4 8 6 18 6 28h-56c0-10 2-20 6-28Z"
          />
          {/* Head */}
          <ellipse cx="160" cy="148" rx="52" ry="58" fill="url(#sil-body)" />
          {/* Headset band */}
          <path
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="5"
            strokeLinecap="round"
            d="M108 148c4-42 28-68 52-68s48 26 52 68"
          />
          {/* Ear cups */}
          <rect
            x="92"
            y="132"
            width="22"
            height="36"
            rx="8"
            fill="rgba(11,18,32,0.9)"
            stroke="rgba(0,245,255,0.45)"
            strokeWidth="2"
            filter="url(#sil-glow)"
          />
          <rect
            x="206"
            y="132"
            width="22"
            height="36"
            rx="8"
            fill="rgba(11,18,32,0.9)"
            stroke="rgba(0,245,255,0.45)"
            strokeWidth="2"
            filter="url(#sil-glow)"
          />
          {/* Visor / HUD strip */}
          <rect
            x="122"
            y="140"
            width="76"
            height="14"
            rx="7"
            fill="url(#sil-visor)"
            filter="url(#sil-glow)"
          />
          {/* Mic boom */}
          <path
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3"
            strokeLinecap="round"
            d="M214 160c18 8 28 22 30 38"
          />
          <circle cx="246" cy="202" r="5" fill="rgba(0,245,255,0.7)" />
        </svg>

        {/* Bottom vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}
