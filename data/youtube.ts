import { BRAND } from "@/lib/constants";

/**
 * Official FlameKyro YouTube channel config.
 * Channel ID is resolved at runtime via the Data API (forHandle).
 */
export const YOUTUBE_CHANNEL = {
  /** Handle without @ — derived from brand, not a hardcoded UC… id */
  handle: BRAND.handle.replace(/^@/, ""),
  channelUrl: `https://www.youtube.com/${BRAND.handle}`,
  /** Latest uploads to surface on the landing grid */
  latestCount: 3,
} as const;

export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/** Channel / uploads cache window */
export const YOUTUBE_CACHE_SECONDS = 600;

/** Live broadcast detection cache — must stay fresh */
export const YOUTUBE_LIVE_CACHE_SECONDS = 60;
