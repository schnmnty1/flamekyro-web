"use client";

import { SocialCarousel } from "@/components/social";
import { AchievementChips } from "@/components/connect/AchievementChips";
import { NowPlayingPanel } from "@/components/connect/NowPlayingPanel";
import { SetupPanel } from "@/components/connect/SetupPanel";

/** Slightly shorter than before — ~65% of carousel stage height */
const PANEL_HEIGHT =
  "h-[min(28vh,270px)] min-h-[200px] sm:min-h-[228px] lg:min-h-[248px] xl:min-h-[270px]";

/** +20% width vs prior pass */
const LEFT_WIDTH =
  "w-[10.5rem] xl:w-[12.6rem] 2xl:w-[13.5rem]";
const RIGHT_WIDTH =
  "w-[11.4rem] xl:w-[13.8rem] 2xl:w-[14.7rem]";

/**
 * Connect band — Social Carousel remains the centerpiece.
 * Side panels dock closer with a subtle inward tilt.
 */
export function ConnectStage() {
  return (
    <div className="relative z-10" style={{ perspective: 1400 }}>
      {/* Desktop / laptop — floating side panels, pulled ~100px toward carousel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-[min(44vh,420px)] min-h-[310px] items-center lg:flex sm:min-h-[360px] lg:min-h-[380px] xl:min-h-[420px]">
        <div
          className={`pointer-events-auto absolute left-[6.5rem] top-1/2 xl:left-[7.25rem] 2xl:left-[8rem] ${LEFT_WIDTH} ${PANEL_HEIGHT}`}
          style={{
            transform: "translateY(-50%) rotateY(5deg)",
            transformOrigin: "100% 50%",
          }}
        >
          <NowPlayingPanel />
        </div>
        <div
          className={`pointer-events-auto absolute right-[6.5rem] top-1/2 xl:right-[7.25rem] 2xl:right-[8rem] ${RIGHT_WIDTH} ${PANEL_HEIGHT}`}
          style={{
            transform: "translateY(-50%) rotateY(-5deg)",
            transformOrigin: "0% 50%",
          }}
        >
          <SetupPanel />
        </div>
      </div>

      {/* Tighter inset — panels sit ~80–120px closer to the stage */}
      <div className="lg:px-[6.25rem] xl:px-[8rem] 2xl:px-[9.25rem]">
        <SocialCarousel />
      </div>

      <div className="relative z-10 mt-3.5 pb-8 sm:mt-4 sm:pb-9">
        <AchievementChips />
      </div>

      {/* Tablet — panels below carousel */}
      <div className="container-page mt-3 hidden grid-cols-2 gap-3 md:grid lg:hidden">
        <div className={PANEL_HEIGHT}>
          <NowPlayingPanel />
        </div>
        <div className={PANEL_HEIGHT}>
          <SetupPanel />
        </div>
      </div>

      {/* Mobile — horizontal swipe cards */}
      <div className="mt-3 md:hidden">
        <div
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Games and setup"
        >
          <div
            className={`w-[min(82vw,20rem)] shrink-0 snap-center ${PANEL_HEIGHT}`}
          >
            <NowPlayingPanel />
          </div>
          <div
            className={`w-[min(82vw,20rem)] shrink-0 snap-center ${PANEL_HEIGHT}`}
          >
            <SetupPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
