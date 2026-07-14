/**
 * Connect-stage enrichment — side panels + achievement chips.
 * Content only; layout lives in components/connect.
 */

export const MAIN_GAMES = {
  title: "Main Games",
  primary: {
    id: "valorant",
    label: "Primary Game",
    name: "VALORANT",
  },
  secondary: {
    id: "gtav",
    label: "Secondary Game",
    name: "Grand Theft Auto V",
  },
  chips: ["Story Games", "Horror Games"] as const,
} as const;

/** @deprecated Use MAIN_GAMES */
export const NOW_PLAYING = MAIN_GAMES;

export const SETUP_ITEMS: readonly {
  id: string;
  label: string;
  name: string;
  icon: "laptop" | "gpu" | "headset";
}[] = [
  {
    id: "laptop",
    label: "Laptop",
    name: "MSI Sword 16 HX",
    icon: "laptop",
  },
  {
    id: "gpu",
    label: "GPU",
    name: "RTX 4050 Laptop GPU",
    icon: "gpu",
  },
  {
    id: "headset",
    label: "Headset",
    name: "HyperX Cloud Stinger",
    icon: "headset",
  },
];

export const SETUP_PANEL = {
  title: "My Setup",
} as const;

/** Static chrome for achievement pills — values come from live YouTube metrics. */
export const ACHIEVEMENT_DEFS = [
  {
    id: "subs",
    icon: "🏆",
    label: "Subscribers",
  },
  {
    id: "views",
    icon: "👀",
    label: "Views",
  },
  {
    id: "videos",
    icon: "🎬",
    label: "Videos",
  },
] as const;

export type SetupIconId = (typeof SETUP_ITEMS)[number]["icon"];
export type GameMarkId = "valorant" | "gtav";
