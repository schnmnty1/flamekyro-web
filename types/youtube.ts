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

/** Offline — no active YouTube Live broadcast */
export type YouTubeLiveOffline = {
  isLive: false;
};

/** Online — active YouTube Live broadcast for the channel */
export type YouTubeLiveOnline = {
  isLive: true;
  title: string;
  videoId: string;
  thumbnail: string;
  /** Reserved — never fabricate viewer counts */
  watching: null;
  url: string;
};

export type YouTubeLiveStatus = YouTubeLiveOffline | YouTubeLiveOnline;

export type YouTubeApiPayload = {
  channel: YouTubeChannelMetrics;
  videos: VideoItem[];
  live: YouTubeLiveStatus;
  fetchedAt: string;
};
