/**
 * YouTube Data API helpers — server-only.
 * Never import this module from client components.
 */

import {
  YOUTUBE_API_BASE,
  YOUTUBE_CACHE_SECONDS,
  YOUTUBE_CHANNEL,
  YOUTUBE_LIVE_CACHE_SECONDS,
  YOUTUBE_STATS_CACHE_SECONDS,
} from "@/data/youtube";
import type { VideoItem } from "@/types/video";
import type {
  YouTubeApiPayload,
  YouTubeChannelMetrics,
  YouTubeLiveStatus,
} from "@/types/youtube";

type YoutubeThumbnails = {
  maxres?: { url: string };
  standard?: { url: string };
  high?: { url: string };
  medium?: { url: string };
  default?: { url: string };
};

function requireApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }
  return key;
}

function youtubeUrl(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  url.searchParams.set("key", requireApiKey());
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function youtubeFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidateSeconds: number = YOUTUBE_CACHE_SECONDS,
): Promise<T> {
  const response = await fetch(youtubeUrl(path, params), {
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `YouTube API ${path} failed (${response.status})${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  return response.json() as Promise<T>;
}

function pickThumbnail(thumbnails?: YoutubeThumbnails): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

/** ISO 8601 duration (PT#H#M#S) → "H:MM:SS" / "M:SS" */
export function formatYouTubeDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export function formatViewCount(count: number): string {
  const abs = Math.abs(count);
  if (abs >= 1_000_000_000) {
    return `${trim(count / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${trim(count / 1_000_000)}M`;
  }
  if (abs >= 10_000) {
    return `${trim(count / 1_000)}K`;
  }
  return new Intl.NumberFormat("en-US").format(count);
}

function trim(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatPublishedDate(iso: string): string {
  const published = new Date(iso);
  if (Number.isNaN(published.getTime())) return "";

  const diffMs = Date.now() - published.getTime();
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);

  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

type ChannelsListResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
    };
    statistics?: {
      subscriberCount?: string;
      videoCount?: string;
      viewCount?: string;
      hiddenSubscriberCount?: boolean;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type PlaylistItemsResponse = {
  items?: Array<{
    contentDetails?: { videoId?: string };
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: YoutubeThumbnails;
    };
  }>;
};

type VideosListResponse = {
  items?: Array<{
    id: string;
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: YoutubeThumbnails;
    };
  }>;
};

type LiveSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      thumbnails?: YoutubeThumbnails;
    };
  }>;
};

/**
 * Detect an active YouTube Live broadcast for the channel.
 * Uses search.list with eventType=live — no fabricated viewer counts.
 */
async function fetchLiveStatus(channelId: string): Promise<YouTubeLiveStatus> {
  const result = await youtubeFetch<LiveSearchResponse>(
    "search",
    {
      part: "snippet",
      channelId,
      eventType: "live",
      type: "video",
      maxResults: 1,
    },
    YOUTUBE_LIVE_CACHE_SECONDS,
  );

  const item = result.items?.[0];
  const videoId = item?.id?.videoId;
  if (!videoId) {
    return { isLive: false };
  }

  return {
    isLive: true,
    title: item.snippet?.title?.trim() || "Live",
    videoId,
    thumbnail: pickThumbnail(item.snippet?.thumbnails),
    watching: null,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

async function resolveChannel(): Promise<{
  channel: YouTubeChannelMetrics;
  uploadsPlaylistId: string;
}> {
  const handle = YOUTUBE_CHANNEL.handle;

  const byHandle = await youtubeFetch<ChannelsListResponse>(
    "channels",
    {
      part: "snippet,statistics,contentDetails",
      forHandle: handle,
    },
    YOUTUBE_STATS_CACHE_SECONDS,
  );

  let item = byHandle.items?.[0];

  // Fallback: search by @handle if forHandle yields nothing
  if (!item) {
    const search = await youtubeFetch<{
      items?: Array<{ id?: { channelId?: string } }>;
    }>("search", {
      part: "snippet",
      type: "channel",
      q: `@${handle}`,
      maxResults: 1,
    });

    const channelId = search.items?.[0]?.id?.channelId;
    if (!channelId) {
      throw new Error(`YouTube channel not found for @${handle}`);
    }

    const byId = await youtubeFetch<ChannelsListResponse>(
      "channels",
      {
        part: "snippet,statistics,contentDetails",
        id: channelId,
      },
      YOUTUBE_STATS_CACHE_SECONDS,
    );
    item = byId.items?.[0];
  }

  if (!item?.id) {
    throw new Error(`YouTube channel not found for @${handle}`);
  }

  const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error("Uploads playlist unavailable for channel");
  }

  const custom = item.snippet?.customUrl?.replace(/^@/, "") ?? handle;

  return {
    uploadsPlaylistId,
    channel: {
      id: item.id,
      title: item.snippet?.title ?? handle,
      handle: custom,
      url: YOUTUBE_CHANNEL.channelUrl,
      subscriberCount: Number(item.statistics?.subscriberCount ?? 0),
      videoCount: Number(item.statistics?.videoCount ?? 0),
      viewCount: Number(item.statistics?.viewCount ?? 0),
    },
  };
}

async function fetchLatestUploads(
  uploadsPlaylistId: string,
  count: number,
): Promise<VideoItem[]> {
  const playlist = await youtubeFetch<PlaylistItemsResponse>("playlistItems", {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: count,
  });

  const entries = (playlist.items ?? [])
    .map((item) => {
      const id =
        item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (!id) return null;
      return {
        id,
        title: item.snippet?.title ?? "Untitled",
        publishedAt: item.snippet?.publishedAt ?? "",
        thumbnail: pickThumbnail(item.snippet?.thumbnails),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length === 0) return [];

  const details = await youtubeFetch<VideosListResponse>("videos", {
    part: "contentDetails,statistics,snippet",
    id: entries.map((entry) => entry.id).join(","),
  });

  const byId = new Map((details.items ?? []).map((item) => [item.id, item]));

  return entries.map((entry) => {
    const detail = byId.get(entry.id);
    const views = Number(detail?.statistics?.viewCount ?? 0);
    const durationIso = detail?.contentDetails?.duration ?? "PT0S";
    const publishedAt =
      detail?.snippet?.publishedAt ?? entry.publishedAt ?? "";
    const thumbnail =
      pickThumbnail(detail?.snippet?.thumbnails) || entry.thumbnail;

    return {
      id: entry.id,
      title: detail?.snippet?.title ?? entry.title,
      thumbnail,
      duration: formatYouTubeDuration(durationIso),
      views: formatViewCount(views),
      uploadedAt: formatPublishedDate(publishedAt),
      url: `https://www.youtube.com/watch?v=${entry.id}`,
    } satisfies VideoItem;
  });
}

/**
 * Full channel + latest uploads + live status for the landing page.
 */
export async function fetchYouTubeBundle(): Promise<YouTubeApiPayload> {
  const { channel, uploadsPlaylistId } = await resolveChannel();
  const [videos, live] = await Promise.all([
    fetchLatestUploads(uploadsPlaylistId, YOUTUBE_CHANNEL.latestCount),
    fetchLiveStatus(channel.id),
  ]);

  return {
    channel,
    videos,
    live,
    fetchedAt: new Date().toISOString(),
  };
}
