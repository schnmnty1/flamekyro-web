"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENT_DEFS } from "@/data/connect";
import {
  formatStreamingSinceAchievement,
  formatSubscriberAchievement,
  formatVideosAchievement,
  formatViewsAchievement,
  type AchievementItem,
} from "@/lib/achievements/milestones";
import { fetchYouTubeFromApi } from "@/lib/youtube/client";
import type { YouTubeChannelMetrics } from "@/types/youtube";

const PLACEHOLDER_ITEMS: AchievementItem[] = ACHIEVEMENT_DEFS.map((def) => ({
  id: def.id,
  icon: def.icon,
  value: "—",
  label: def.label,
}));

/**
 * Achievement pills from the shared `/api/youtube` payload (deduped with stats).
 */
export function useAchievements(): {
  items: AchievementItem[];
  loading: boolean;
} {
  const [items, setItems] = useState<AchievementItem[]>(PLACEHOLDER_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetchYouTubeFromApi()
      .then((payload) => {
        if (cancelled) return;
        setItems(buildAchievements(payload.channel));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setItems(buildAchievements(null));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}

function buildAchievements(
  channel: YouTubeChannelMetrics | null,
): AchievementItem[] {
  const items: AchievementItem[] = [];

  const subsDef = ACHIEVEMENT_DEFS.find((d) => d.id === "subs");
  const viewsDef = ACHIEVEMENT_DEFS.find((d) => d.id === "views");
  const videosDef = ACHIEVEMENT_DEFS.find((d) => d.id === "videos");

  if (subsDef && channel) {
    const subs = formatSubscriberAchievement(channel.subscriberCount);
    if (subs) {
      items.push({ id: subsDef.id, icon: subsDef.icon, ...subs });
    }
  }

  if (viewsDef && channel) {
    const views = formatViewsAchievement(channel.viewCount);
    if (views) {
      items.push({ id: viewsDef.id, icon: viewsDef.icon, ...views });
    }
  }

  if (videosDef) {
    const videos =
      channel != null
        ? formatVideosAchievement(channel.videoCount)
        : null;

    if (videos) {
      items.push({ id: videosDef.id, icon: videosDef.icon, ...videos });
    } else {
      const since = formatStreamingSinceAchievement(channel?.publishedAt);
      if (since) {
        items.push({
          id: "streaming-since",
          icon: videosDef.icon,
          ...since,
        });
      }
    }
  }

  return items;
}
