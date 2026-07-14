import type { VideoItem } from "@/types/video";

/**
 * Temporary mock uploads — replace with API / YouTube feed later.
 */
export const LATEST_VIDEOS: readonly VideoItem[] = [
  {
    id: "v-ace-clutch",
    title: "Insane 1v4 Ace Clutch — Ranked Valorant",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=960&h=540&q=80",
    duration: "14:22",
    views: "214K",
    uploadedAt: "2 days ago",
    url: "https://www.youtube.com/@FlameKyro",
  },
  {
    id: "v-funny-fails",
    title: "Funny Moments That Broke The Squad",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=960&h=540&q=80",
    duration: "11:05",
    views: "189K",
    uploadedAt: "5 days ago",
    url: "https://www.youtube.com/@FlameKyro",
  },
  {
    id: "v-ranked-grind",
    title: "From Gold to Immortal — Ranked Grind Highlights",
    thumbnail:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=960&h=540&q=80",
    duration: "18:47",
    views: "156K",
    uploadedAt: "1 week ago",
    url: "https://www.youtube.com/@FlameKyro",
  },
] as const;

/** Destination for the section CTA — swap when a videos page exists */
export const VIDEOS_INDEX_URL = "https://www.youtube.com/@FlameKyro";
