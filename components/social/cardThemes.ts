import type { SocialIconId } from "@/types/social";

/**
 * Carousel-only visual materials — saturated brand colors per platform.
 * Separated from link data so art direction can evolve without touching URLs.
 */
export type PlatformCardTheme = {
  /** Dominant card body */
  surface: string;
  /** Secondary accent wash / sheen */
  wash: string;
  /** Ambient glow behind the active card */
  glow: string;
  /** Soft under-card shadow tint */
  shadow: string;
  /** Icon / specular tint */
  accent: string;
  /** Icon plate fill */
  iconPlate: string;
};

export const PLATFORM_CARD_THEMES: Record<SocialIconId, PlatformCardTheme> = {
  youtube: {
    surface: "linear-gradient(155deg, #FF5C5C 0%, #E00B00 42%, #9B0F0F 100%)",
    wash: "radial-gradient(ellipse 90% 70% at 20% 0%, rgba(255,180,160,0.45) 0%, transparent 55%)",
    glow: "rgba(255, 45, 45, 0.55)",
    shadow: "rgba(220, 20, 20, 0.45)",
    accent: "#FFFFFF",
    iconPlate: "rgba(0,0,0,0.22)",
  },
  instagram: {
    surface:
      "linear-gradient(145deg, #F58529 0%, #DD2A7B 48%, #8134AF 78%, #515BD4 100%)",
    wash: "radial-gradient(ellipse 80% 60% at 80% 10%, rgba(255,255,255,0.28) 0%, transparent 50%)",
    glow: "rgba(225, 48, 108, 0.5)",
    shadow: "rgba(131, 58, 180, 0.4)",
    accent: "#FFFFFF",
    iconPlate: "rgba(255,255,255,0.16)",
  },
  discord: {
    surface: "linear-gradient(155deg, #7B86F9 0%, #5865F2 45%, #3C45C0 100%)",
    wash: "radial-gradient(ellipse 85% 65% at 15% 0%, rgba(180,190,255,0.4) 0%, transparent 55%)",
    glow: "rgba(88, 101, 242, 0.55)",
    shadow: "rgba(70, 80, 220, 0.42)",
    accent: "#FFFFFF",
    iconPlate: "rgba(0,0,0,0.18)",
  },
  tiktok: {
    surface:
      "linear-gradient(150deg, #25F4EE 0%, #121212 38%, #121212 62%, #FE2C55 100%)",
    wash: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 50%)",
    glow: "rgba(37, 244, 238, 0.4)",
    shadow: "rgba(254, 44, 85, 0.35)",
    accent: "#FFFFFF",
    iconPlate: "rgba(255,255,255,0.1)",
  },
  x: {
    surface: "linear-gradient(155deg, #3A3A3A 0%, #1A1A1A 48%, #0A0A0A 100%)",
    wash: "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 55%)",
    glow: "rgba(255, 255, 255, 0.22)",
    shadow: "rgba(0, 0, 0, 0.55)",
    accent: "#FFFFFF",
    iconPlate: "rgba(255,255,255,0.08)",
  },
  twitch: {
    surface: "linear-gradient(155deg, #BF94FF 0%, #9146FF 42%, #5C1FB8 100%)",
    wash: "radial-gradient(ellipse 85% 65% at 18% 0%, rgba(230,210,255,0.42) 0%, transparent 55%)",
    glow: "rgba(145, 70, 255, 0.55)",
    shadow: "rgba(120, 50, 230, 0.45)",
    accent: "#FFFFFF",
    iconPlate: "rgba(0,0,0,0.2)",
  },
  kick: {
    surface: "linear-gradient(155deg, #7CFF4D 0%, #53FC18 42%, #1FA800 100%)",
    wash: "radial-gradient(ellipse 85% 65% at 18% 0%, rgba(200,255,160,0.45) 0%, transparent 55%)",
    glow: "rgba(83, 252, 24, 0.55)",
    shadow: "rgba(40, 180, 10, 0.42)",
    accent: "#0A0A0A",
    iconPlate: "rgba(0,0,0,0.22)",
  },
};

/** Kept for any legacy imports — mirrors archiveCoverflow STEP_PX */
export const CARD_SPACING = {
  compact: 186,
  desktop: 186,
} as const;

/**
 * Critically damped springs — settle with no bounce / overshoot.
 * damping ≈ 2 * sqrt(stiffness * mass)
 */
export const COVERFLOW_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 39,
  mass: 1,
};

export const DRAG_RELEASE_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 41,
  mass: 1,
};
