"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useMusic } from "@/components/music/context";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";
import { SPRING_SOFT } from "@/lib/motion";

/**
 * Floating glass transport — bottom-right, post-unlock only.
 */
export function MusicController() {
  const {
    unlocked,
    isPlaying,
    isMuted,
    volume,
    track,
    togglePlay,
    toggleMute,
    setVolume,
  } = useMusic();
  const reducedMotion = usePrefersReducedMotion();

  const controlClass =
    "glass-control inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 " +
    "hover:border-white/[0.16] hover:bg-white/[0.1] hover:text-white " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/55 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <AnimatePresence>
      {unlocked ? (
        <motion.div
          key="music-controller"
          role="region"
          aria-label={`Music controls — ${track.title}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
          transition={SPRING_SOFT}
          className="fixed right-4 bottom-4 z-[60] sm:right-6 sm:bottom-6"
        >
          <div className="glass-panel flex items-center gap-2 rounded-2xl px-2.5 py-2">
            <button
              type="button"
              className={controlClass}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              onClick={() => void togglePlay()}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4 translate-x-px" aria-hidden />
              )}
            </button>

            <button
              type="button"
              className={controlClass}
              aria-label={isMuted || volume === 0 ? "Unmute music" : "Mute music"}
              aria-pressed={isMuted || volume === 0}
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden />
              )}
            </button>

            <label className="flex items-center gap-2 pr-1">
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)} percent`}
                onChange={(event) => setVolume(Number(event.target.value))}
                className={cn(
                  "h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/12 sm:w-24",
                  "accent-glow [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
                  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:bg-glow [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,245,255,0.45)]",
                )}
              />
            </label>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
