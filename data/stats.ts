import type { StatCardDefinition, StatCardModel } from "@/types/stats";

/**
 * YouTube-backed metric shells.
 * Live adapters fill subscriber / video / view counts from `/api/youtube`.
 */
export const STAT_CARD_DEFINITIONS: readonly StatCardDefinition[] = [
  {
    id: "youtube",
    title: "Subscribers",
    subtitle: "YouTube",
    icon: "youtube",
    accent: "#FF5A45",
  },
  {
    id: "videos",
    title: "Videos",
    subtitle: "Published",
    icon: "videos",
    accent: "#8B5CF6",
  },
  {
    id: "views",
    title: "Views",
    subtitle: "All-time",
    icon: "views",
    accent: "#00F5FF",
  },
] as const;

/** Pending shells for UI while APIs are disconnected */
export function buildPendingStatCards(): StatCardModel[] {
  return STAT_CARD_DEFINITIONS.map((def) => ({
    ...def,
    value: null,
    status: "loading",
    animateValue: false,
  }));
}

export const STATS_SECTION = {
  heading: "CREATOR STATS",
  connectingLabel: "Connecting to YouTube…",
  errorLabel: "Unable to load YouTube data. Try again later.",
} as const;

/** Background stats poll cadence — single source of truth (active) */
export const STATS_REFRESH_INTERVAL_MS = 10_000;

/** Backoff cadence after sustained unchanged refreshes */
export const STATS_REFRESH_INTERVAL_IDLE_MS = 20_000;

/** Unchanged successful refreshes before switching to idle cadence */
export const STATS_STALE_STREAK_BEFORE_IDLE = 5;

/** Digit roll duration for live value changes */
export const STATS_ODOMETER_DURATION_MS = 400;
