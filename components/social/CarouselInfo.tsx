"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SPRING_SOFT } from "@/lib/motion";
import type { SocialPlatform } from "@/types/social";

type CarouselInfoProps = {
  platform: SocialPlatform;
};

/**
 * Active platform handle under the carousel — handle only.
 */
export function CarouselInfo({ platform }: CarouselInfoProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg justify-center px-4 text-center">
      <AnimatePresence mode="wait">
        <motion.a
          key={platform.id}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={SPRING_SOFT}
          className="text-sm tracking-[0.02em] text-glow/70 underline-offset-4 transition-colors duration-300 hover:text-glow hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {platform.handle}
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
