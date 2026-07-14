"use client";

import { useMusic } from "@/components/music/context";
import { cn } from "@/lib/cn";

/**
 * Subtle Hero glass pill — toggles ambient music (never autoplays).
 */
export function MusicController() {
  const { available, isPlaying, togglePlay } = useMusic();

  const label = isPlaying ? "♫ Music ON" : "♪ Play Ambient";

  return (
    <button
      type="button"
      disabled={!available}
      aria-disabled={!available}
      aria-pressed={available ? isPlaying : undefined}
      aria-label={
        !available
          ? "Background music unavailable"
          : isPlaying
            ? "Turn ambient music off"
            : "Play ambient music"
      }
      onClick={() => {
        if (!available) return;
        void togglePlay();
      }}
      className={cn(
        "glass-panel radius-pill inline-flex items-center justify-center",
        "px-3.5 py-1.5 text-[0.65rem] font-medium tracking-[0.14em] uppercase",
        "transition-[color,border-color,background-color,opacity] duration-300",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/55",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        available
          ? isPlaying
            ? "text-white/78 hover:border-white/[0.14] hover:text-white/90"
            : "text-white/52 hover:border-white/[0.12] hover:text-white/72"
          : "cursor-not-allowed text-white/28 opacity-50",
      )}
    >
      <span className="leading-none">{label}</span>
    </button>
  );
}
