"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { useMusic } from "@/components/music/context";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

/**
 * Bottom-right unlock hint — same corner as MusicController, never overlaps content.
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
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
          transition={SPRING_SOFT}
          className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div
            className={
              reducedMotion
                ? "glass-panel inline-flex max-w-[11.5rem] items-center gap-2 rounded-2xl px-3 py-2 text-[0.65rem] tracking-[0.14em] text-white/68 uppercase sm:max-w-none sm:text-[0.7rem]"
                : "glass-panel music-hint-pulse inline-flex max-w-[11.5rem] items-center gap-2 rounded-2xl px-3 py-2 text-[0.65rem] tracking-[0.14em] text-white/68 uppercase sm:max-w-none sm:text-[0.7rem]"
            }
          >
            <Music2 className="h-3.5 w-3.5 shrink-0 text-glow/75" aria-hidden />
            <span className="leading-snug">Start music</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
