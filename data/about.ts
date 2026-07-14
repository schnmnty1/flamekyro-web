import type { AboutProfile } from "@/types/about";

/**
 * Creator profile copy for the About section.
 * Swap setupHref when a dedicated setup page/section ships.
 */
export const ABOUT_PROFILE: AboutProfile = {
  heading: "ABOUT FLAMEKYRO",
  subtitle: "Every round tells a story.",
  bio: "FlameKyro is a Valorant creator built for the clutch — sharp aim, louder energy, and the kind of moments that turn ranked nights into highlight reels. From India, streaming and uploading in Hindi and English so the whole squad can ride along.",
  badges: [
    {
      id: "main-game",
      label: "Main Game",
      values: ["Valorant"],
    },
    {
      id: "other-games",
      label: "Other Games",
      values: ["GTA V", "Story Games", "Horror Games"],
    },
    {
      id: "country",
      label: "Country",
      values: ["India"],
    },
    {
      id: "languages",
      label: "Languages",
      values: ["Hindi", "English"],
    },
  ],
  setupHref: "#setup",
};
