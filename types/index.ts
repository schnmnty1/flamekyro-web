import type { ReactNode } from "react";

export type { SocialIconId, SocialPlatform } from "./social";
export type {
  MusicContextValue,
  MusicPreferences,
  MusicTrack,
} from "./music";
export type {
  VideoItem,
  VideosAdapter,
  VideosSnapshot,
  VideosSource,
} from "./video";
export type {
  CreatorStatsAdapter,
  CreatorStatsSnapshot,
  CreatorStatsSource,
  StatCardDefinition,
  StatCardModel,
  StatIconId,
  StatStatus,
  StatTrend,
  StatTrendDirection,
} from "./stats";
export type {
  YouTubeApiPayload,
  YouTubeChannelMetrics,
  YouTubeLiveOffline,
  YouTubeLiveOnline,
  YouTubeLiveStatus,
} from "./youtube";

/** Shared layout contract for page shells */
export type PageLayoutProps = {
  children: ReactNode;
  className?: string;
};

/** Generic children-only provider / wrapper */
export type WithChildren = {
  children: ReactNode;
};
