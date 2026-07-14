/** Brand identity — shared across metadata, layout, and sections */
export const BRAND = {
  name: "FlameKyro",
  handle: "@FlameKyro",
  tagline: "Gaming Creator",
  eyebrow: "VALORANT • EPIC CLUTCHES • FUNNY MOMENTS",
  liveLabel: "LIVE DAILY AROUND 10 AM",
} as const;

/** External destinations — update when official links are finalized */
export const LINKS = {
  discord: "https://discord.gg/flamekyro",
  watchLive: "https://www.twitch.tv/flamekyro",
} as const;

/** Design tokens mirrored in globals.css for JS consumers */
export const THEME = {
  background: "#050816",
  surface: "#0B1220",
  primary: "#7C3AED",
  secondary: "#06B6D4",
  accent: "#8B5CF6",
  glow: "#00F5FF",
  ambientOrange: "#F59E0B",
  text: "#FFFFFF",
} as const;
