import type { SocialIconId } from "@/types/social";

/**
 * Carousel-only visual materials — brand palette per platform.
 * Separated from link data so art direction can evolve without touching URLs.
 */
export type PlatformCardTheme = {
  /** Soft glass body gradient */
  surface: string;
  /** Rich accent wash (top → bottom) */
  wash: string;
  /** Ambient glow behind the active card */
  glow: string;
  /** Soft under-card shadow tint */
  shadow: string;
  /** Icon / specular tint */
  accent: string;
};

export const PLATFORM_CARD_THEMES: Record<SocialIconId, PlatformCardTheme> = {
  youtube: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(40,12,12,0.55) 48%, rgba(18,8,10,0.72) 100%)",
    wash: "linear-gradient(145deg, rgba(255,59,48,0.55) 0%, rgba(255,106,61,0.28) 42%, rgba(255,140,70,0.08) 100%)",
    glow: "rgba(255, 69, 58, 0.42)",
    shadow: "rgba(255, 59, 48, 0.28)",
    accent: "#FF5A45",
  },
  instagram: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(36,14,28,0.55) 48%, rgba(16,8,20,0.72) 100%)",
    wash: "linear-gradient(135deg, rgba(253,29,155,0.50) 0%, rgba(255,120,60,0.32) 40%, rgba(131,58,180,0.28) 100%)",
    glow: "rgba(255, 110, 90, 0.40)",
    shadow: "rgba(225, 48, 108, 0.28)",
    accent: "#FF6B8A",
  },
  discord: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(18,20,48,0.58) 48%, rgba(10,12,28,0.74) 100%)",
    wash: "linear-gradient(145deg, rgba(88,101,242,0.55) 0%, rgba(114,137,218,0.22) 50%, transparent 100%)",
    glow: "rgba(88, 101, 242, 0.45)",
    shadow: "rgba(88, 101, 242, 0.30)",
    accent: "#7289DA",
  },
  tiktok: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(22,24,28,0.62) 45%, rgba(8,10,12,0.78) 100%)",
    wash: "linear-gradient(135deg, rgba(105,201,208,0.35) 0%, rgba(254,44,85,0.18) 55%, transparent 100%)",
    glow: "rgba(80, 220, 230, 0.38)",
    shadow: "rgba(254, 44, 85, 0.18)",
    accent: "#69C9D0",
  },
  x: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(24,26,30,0.60) 48%, rgba(10,12,14,0.78) 100%)",
    wash: "linear-gradient(145deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 45%, transparent 100%)",
    glow: "rgba(255, 255, 255, 0.28)",
    shadow: "rgba(255, 255, 255, 0.12)",
    accent: "#F5F5F7",
  },
  twitch: {
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(28,16,48,0.58) 48%, rgba(12,8,24,0.74) 100%)",
    wash: "linear-gradient(145deg, rgba(145,70,255,0.50) 0%, rgba(169,112,255,0.20) 50%, transparent 100%)",
    glow: "rgba(145, 70, 255, 0.42)",
    shadow: "rgba(145, 70, 255, 0.28)",
    accent: "#BF94FF",
  },
};

/** Physical coverflow spring — used for card settle + drag release */
export const COVERFLOW_SPRING = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
  mass: 0.85,
};

export const DRAG_RELEASE_SPRING = {
  type: "spring" as const,
  stiffness: 200,
  damping: 24,
  mass: 0.7,
};
