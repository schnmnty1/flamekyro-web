/** Brand identity — shared across metadata, layout, and sections */
export const BRAND = {
  name: "FlameKyro",
  handle: "@FlameKyro",
  tagline: "Gaming Creator",
  liveLabel: "LIVE DAILY AROUND 10 AM",
  description:
    "Official FlameKyro website — Valorant clutches, funny moments, and live streams. Watch the latest uploads and catch the grind.",
} as const;

/**
 * Canonical site origin for metadata, sitemap, and OG URLs.
 * Override with NEXT_PUBLIC_SITE_URL in production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://flamekyro.com";

/** External destinations — update when official links are finalized */
export const LINKS = {
  discord: "https://discord.gg/BfmGewPdpy",
  watchLive: `https://www.youtube.com/${BRAND.handle}`,
  youtube: `https://www.youtube.com/${BRAND.handle}`,
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
