"use client";

import { useEffect, useState } from "react";
import { fetchYouTubeFromApi } from "@/lib/youtube/client";
import type { YouTubeLiveStatus } from "@/types/youtube";

export type HeroLiveView = {
  isLive: boolean;
  statusLabel: string;
  liveTitle: string | null;
};

const NOT_LIVE: HeroLiveView = {
  isLive: false,
  statusLabel: "NOT LIVE RIGHT NOW",
  liveTitle: null,
};

/**
 * Hero stream status from `/api/youtube` (shared in-flight with stats/videos).
 * Defaults to not-live until the real response arrives — never fakes live.
 */
export function useYouTubeLive(): HeroLiveView {
  const [view, setView] = useState<HeroLiveView>(NOT_LIVE);

  useEffect(() => {
    let cancelled = false;

    void fetchYouTubeFromApi()
      .then((payload) => {
        if (cancelled) return;
        setView(mapLiveToHero(payload.live));
      })
      .catch(() => {
        if (cancelled) return;
        setView(NOT_LIVE);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return view;
}

function mapLiveToHero(live: YouTubeLiveStatus): HeroLiveView {
  if (!live.isLive) {
    return NOT_LIVE;
  }

  return {
    isLive: true,
    statusLabel: "LIVE ON YOUTUBE",
    liveTitle: live.title,
  };
}
