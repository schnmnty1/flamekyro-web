"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SPRING_SOFT } from "@/lib/motion";
import type { SocialPlatform } from "@/types/social";

type CarouselInfoProps = {
  platform: SocialPlatform;
};

/**
 * Active platform copy under the carousel.
 * Music unlock hint lives in MusicProvider (not duplicated here).
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
          <p className="text-brand text-lg font-semibold tracking-[0.02em] text-white/95 sm:text-xl">
            {platform.name}
          </p>
          <p className="text-sm leading-relaxed tracking-[-0.01em] text-white/42 sm:text-base">
            {platform.description}
          </p>
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.01em] text-glow/75 underline-offset-4 transition-colors duration-300 hover:text-glow hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {platform.handle}
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
