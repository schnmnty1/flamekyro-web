import type { SocialPlatform } from "@/types/social";

/**
 * FLAMEKYRO social destinations — single source of truth for the carousel.
 * Update URLs / handles here; UI reads this array only.
 */
export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  {
    id: "twitch",
    name: "Twitch",
    handle: "@FLAMEKYRO",
    url: "https://www.twitch.tv/flamekyro",
    description: "Live Valorant sessions, clutches, and daily streams.",
    accent: "#9146FF",
    icon: "twitch",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@FLAMEKYRO",
    url: "https://www.youtube.com/@FLAMEKYRO",
    description: "Highlights, funny moments, and long-form uploads.",
    accent: "#FF0000",
    icon: "youtube",
  },
  {
    id: "discord",
    name: "Discord",
    handle: "FLAMEKYRO Community",
    url: "https://discord.gg/flamekyro",
    description: "Join the squad — chat, clips, and community events.",
    accent: "#5865F2",
    icon: "discord",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@FLAMEKYRO",
    url: "https://www.instagram.com/flamekyro",
    description: "Behind the scenes, shorts, and stream vibes.",
    accent: "#E4405F",
    icon: "instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@FLAMEKYRO",
    url: "https://www.tiktok.com/@flamekyro",
    description: "Quick clutches and chaotic gaming moments.",
    accent: "#69C9D0",
    icon: "tiktok",
  },
  {
    id: "x",
    name: "X",
    handle: "@FLAMEKYRO",
    url: "https://x.com/flamekyro",
    description: "Updates, schedule drops, and community shoutouts.",
    accent: "#A8B3CF",
    icon: "x",
  },
] as const;

export const SOCIAL_PLATFORM_COUNT = SOCIAL_PLATFORMS.length;
