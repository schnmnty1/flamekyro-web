import type { VideoItem } from "@/types/video";

/** Shared payload returned by `/api/youtube` and consumed by adapters */
export type YouTubeChannelMetrics = {
  id: string;
  title: string;
  handle: string;
  url: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
};

export type YouTubeApiPayload = {
  channel: YouTubeChannelMetrics;
  videos: VideoItem[];
  fetchedAt: string;
};
