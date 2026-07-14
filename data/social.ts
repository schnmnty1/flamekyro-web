import type { SocialPlatform } from "@/types/social";

/**
 * FlameKyro social destinations — single source of truth for the carousel.
 * Update URLs / handles here; UI reads this array only.
 */
export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  {
    id: "twitch",
    name: "Twitch",
    handle: "@FlameKyro",
    url: "https://www.twitch.tv/flamekyro",
    description: "Live Valorant sessions, clutches, and daily streams.",
    accent: "#9146FF",
    icon: "twitch",
  },
  {
    id: "kick",
    name: "Kick",
    handle: "@FlameKyro",
    url: "https://kick.com/flamekyro",
    description: "Live streams and unfiltered gaming sessions.",
    accent: "#53FC18",
    icon: "kick",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@FlameKyro",
    url: "https://www.youtube.com/@FlameKyro",
    description: "Highlights, funny moments, and long-form uploads.",
    accent: "#FF0000",
    icon: "youtube",
  },
  {
    id: "discord",
    name: "Discord",
    handle: "FlameKyro Community",
    url: "https://discord.gg/BfmGewPdpy",
    description: "Join the squad — chat, clips, and community events.",
    accent: "#5865F2",
    icon: "discord",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@FlameKyro",
    url: "https://www.instagram.com/flamekyro",
    description: "Behind the scenes, shorts, and stream vibes.",
    accent: "#E4405F",
    icon: "instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@FlameKyro",
    url: "https://www.tiktok.com/@flamekyro",
    description: "Quick clutches and chaotic gaming moments.",
    accent: "#69C9D0",
    icon: "tiktok",
  },
  {
    id: "x",
    name: "X",
    handle: "@FlameKyro",
    url: "https://x.com/flamekyro",
    description: "Updates, schedule drops, and community shoutouts.",
    accent: "#A8B3CF",
    icon: "x",
  },
] as const;

export const SOCIAL_PLATFORM_COUNT = SOCIAL_PLATFORMS.length;
