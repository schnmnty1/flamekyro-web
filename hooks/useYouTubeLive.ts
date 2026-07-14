"use client";

import { useEffect, useState } from "react";
import { BRAND, LINKS } from "@/lib/constants";
import { fetchYouTubeFromApi } from "@/lib/youtube/client";
import type { YouTubeLiveStatus } from "@/types/youtube";

export type HeroLiveView = {
  isLive: boolean;
  statusLabel: string;
  liveTitle: string | null;
  watchUrl: string;
};

const OFFLINE: HeroLiveView = {
  isLive: false,
  statusLabel: BRAND.liveLabel,
  liveTitle: null,
  watchUrl: LINKS.watchLive,
};

/**
 * Hero live status from `/api/youtube` (shared in-flight with stats/videos).
 * Defaults to offline UI until the real response arrives — never fakes live.
 */
export function useYouTubeLive(): HeroLiveView {
  const [view, setView] = useState<HeroLiveView>(OFFLINE);

  useEffect(() => {
    let cancelled = false;

    void fetchYouTubeFromApi()
      .then((payload) => {
        if (cancelled) return;
        setView(mapLiveToHero(payload.live));
      })
      .catch(() => {
        if (cancelled) return;
        setView(OFFLINE);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return view;
}

function mapLiveToHero(live: YouTubeLiveStatus): HeroLiveView {
  if (!live.isLive) {
    return OFFLINE;
  }

  return {
    isLive: true,
    statusLabel: "LIVE NOW",
    liveTitle: live.title,
    watchUrl: live.url,
  };
}
