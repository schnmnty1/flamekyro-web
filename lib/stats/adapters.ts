import { buildPendingStatCards, STAT_CARD_DEFINITIONS } from "@/data/stats";
import { fetchYouTubeFromApi } from "@/lib/youtube/client";
import type {
  CreatorStatsAdapter,
  CreatorStatsSnapshot,
  StatCardModel,
} from "@/types/stats";
import type { YouTubeApiPayload } from "@/types/youtube";

function mapYouTubeToStats(payload: YouTubeApiPayload): StatCardModel[] {
  const byId = new Map(STAT_CARD_DEFINITIONS.map((def) => [def.id, def]));

  const youtube = byId.get("youtube");
  const videos = byId.get("videos");
  const views = byId.get("views");

  const cards: StatCardModel[] = [];

  if (youtube) {
    cards.push({
      ...youtube,
      value: payload.channel.subscriberCount,
      status: "ready",
      animateValue: true,
    });
  }

  if (videos) {
    cards.push({
      ...videos,
      value: payload.channel.videoCount,
      status: "ready",
      animateValue: true,
    });
  }

  if (views) {
    cards.push({
      ...views,
      value: payload.channel.viewCount,
      status: "ready",
      animateValue: true,
    });
  }

  return cards;
}

/**
 * Pending adapter — no fabricated metrics.
 */
export const pendingCreatorStatsAdapter: CreatorStatsAdapter = {
  async fetchStats(): Promise<CreatorStatsSnapshot> {
    return {
      fetchedAt: null,
      source: "pending",
      stats: buildPendingStatCards(),
    };
  },
};

/**
 * Live YouTube adapter — reads channel metrics via `/api/youtube`.
 */
export const youtubeCreatorStatsAdapter: CreatorStatsAdapter = {
  async fetchStats(options): Promise<CreatorStatsSnapshot> {
    const payload = await fetchYouTubeFromApi(
      options?.signal ? { signal: options.signal } : undefined,
    );
    return {
      fetchedAt: payload.fetchedAt,
      source: "live",
      stats: mapYouTubeToStats(payload),
    };
  },
};

/** @deprecated Prefer youtubeCreatorStatsAdapter */
export const remoteCreatorStatsAdapter = youtubeCreatorStatsAdapter;

/** @deprecated Alias for older imports */
export const mockCreatorStatsAdapter = pendingCreatorStatsAdapter;

let activeAdapter: CreatorStatsAdapter = youtubeCreatorStatsAdapter;

export function setCreatorStatsAdapter(adapter: CreatorStatsAdapter): void {
  activeAdapter = adapter;
}

export function getCreatorStatsAdapter(): CreatorStatsAdapter {
  return activeAdapter;
}

export async function fetchCreatorStats(options?: {
  signal?: AbortSignal;
}): Promise<CreatorStatsSnapshot> {
  return getCreatorStatsAdapter().fetchStats(options);
}
