"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SPRING_SOFT } from "@/lib/motion";
import type { SocialPlatform } from "@/types/social";

type CarouselInfoProps = {
  platform: SocialPlatform;
};

/**
 * Active platform copy + music hint (visual only — no audio yet).
 */
export function CarouselInfo({ platform }: CarouselInfoProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-4 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={platform.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING_SOFT}
          className="space-y-2"
        >
          <p className="text-brand text-lg font-semibold tracking-wide text-white sm:text-xl">
            {platform.name}
          </p>
          <p className="text-sm text-white/45 sm:text-base">
            {platform.description}
          </p>
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-glow/80 underline-offset-4 transition-colors hover:text-glow hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {platform.handle}
          </a>
        </motion.div>
      </AnimatePresence>

      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/30 sm:text-xs">
        Click anywhere to start music
      </p>
    </div>
  );
}
