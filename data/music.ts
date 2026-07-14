import type { MusicTrack } from "@/types/music";

/**
 * Active soundtrack catalog.
 * Replace `src` (or add tracks) here — MusicProvider / UI stay unchanged.
 */
export const MUSIC_TRACKS: readonly MusicTrack[] = [
  {
    id: "theme",
    title: "FlameKyro Theme",
    src: "/audio/theme.mp3",
    loop: true,
  },
] as const;

/** Default track used by MusicProvider */
export const DEFAULT_MUSIC_TRACK = MUSIC_TRACKS[0];

export const MUSIC_STORAGE_KEY = "flamekyro.music.preferences";

export const MUSIC_FADE_MS = 1000;

export const MUSIC_DEFAULT_PREFERENCES = {
  volume: 0.45,
  muted: false,
  playing: true,
} as const;
