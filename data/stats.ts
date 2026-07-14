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
  subtitle: "The numbers behind the grind.",
  connectingLabel: "Connecting to YouTube…",
  errorLabel: "Unable to load YouTube data. Try again later.",
} as const;
