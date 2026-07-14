"use client";

import { GameMark } from "@/components/connect/GameMark";
import { MAIN_GAMES } from "@/data/connect";
import { cn } from "@/lib/cn";

type NowPlayingPanelProps = {
  className?: string;
};

const PANEL_SURFACE =
  "border-white/[0.07] bg-[linear-gradient(155deg,rgba(255,255,255,0.045)_0%,rgba(11,18,32,0.72)_45%,rgba(5,8,22,0.88)_100%)]";

/**
 * Slim floating glass — primary games on the channel (not live status).
 */
export function NowPlayingPanel({ className }: NowPlayingPanelProps) {
  return (
    <aside
      aria-label={MAIN_GAMES.title}
      className={cn(
        "glass-panel radius-panel panel-pad flex h-full flex-col",
        PANEL_SURFACE,
        className,
      )}
    >
      <p className="text-section text-[0.625rem] tracking-[0.22em] text-white/34">
        {MAIN_GAMES.title}
      </p>

      <div className="mt-3 flex flex-1 flex-col justify-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="icon-plate flex h-10 w-10 items-center justify-center text-[#FF4655] sm:h-11 sm:w-11">
            <GameMark id={MAIN_GAMES.primary.id} />
          </span>
          <span className="min-w-0 text-left">
            <span className="text-panel-label block">
              {MAIN_GAMES.primary.label}
            </span>
            <span className="text-panel-title mt-0.5 block">
              {MAIN_GAMES.primary.name}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="icon-plate flex h-10 w-10 items-center justify-center text-white sm:h-11 sm:w-11">
            <GameMark id={MAIN_GAMES.secondary.id} />
          </span>
          <span className="min-w-0 text-left">
            <span className="text-panel-label block">
              {MAIN_GAMES.secondary.label}
            </span>
            <span className="text-panel-title mt-0.5 block text-white/72">
              {MAIN_GAMES.secondary.name}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {MAIN_GAMES.chips.map((chip) => (
          <span
            key={chip}
            className="rounded-[var(--radius-pill)] border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[0.6rem] tracking-[0.04em] text-white/40"
          >
            {chip}
          </span>
        ))}
      </div>
    </aside>
  );
}
