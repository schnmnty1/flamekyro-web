"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { useMusic } from "@/components/music/context";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

/**
 * Bottom-center unlock hint — visible until first user gesture starts audio.
 */
export function MusicHint() {
  const { unlocked } = useMusic();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {!unlocked ? (
        <motion.div
          key="music-hint"
          role="status"
          aria-live="polite"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={SPRING_SOFT}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 sm:bottom-8"
        >
          <div
            className={
              reducedMotion
                ? "glass-panel inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs tracking-[0.2em] text-white/68 uppercase sm:text-[0.7rem]"
                : "glass-panel music-hint-pulse inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs tracking-[0.2em] text-white/68 uppercase sm:text-[0.7rem]"
            }
          >
            <Music2 className="h-3.5 w-3.5 text-glow/75" aria-hidden />
            <span>Click anywhere to start music</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
