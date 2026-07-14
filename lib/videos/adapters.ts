import { fetchYouTubeFromApi } from "@/lib/youtube/client";
import type { VideosAdapter, VideosSnapshot } from "@/types/video";

/**
 * Pending adapter — returns no fabricated video content.
 */
export const pendingVideosAdapter: VideosAdapter = {
  async fetchLatestVideos(): Promise<VideosSnapshot> {
    return {
      fetchedAt: null,
      source: "pending",
      videos: [],
    };
  },
};

/**
 * Live YouTube adapter — latest uploads via `/api/youtube`.
 */
export const youtubeVideosAdapter: VideosAdapter = {
  async fetchLatestVideos(): Promise<VideosSnapshot> {
    const payload = await fetchYouTubeFromApi();
    return {
      fetchedAt: payload.fetchedAt,
      source: "live",
      videos: payload.videos,
    };
  },
};

/** @deprecated Prefer youtubeVideosAdapter */
export const remoteVideosAdapter = youtubeVideosAdapter;

let activeAdapter: VideosAdapter = youtubeVideosAdapter;

export function setVideosAdapter(adapter: VideosAdapter): void {
  activeAdapter = adapter;
}

export function getVideosAdapter(): VideosAdapter {
  return activeAdapter;
}

export async function fetchLatestVideos(): Promise<VideosSnapshot> {
  return getVideosAdapter().fetchLatestVideos();
}
