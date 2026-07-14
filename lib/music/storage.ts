import {
  MUSIC_DEFAULT_PREFERENCES,
  MUSIC_STORAGE_KEY,
} from "@/data/music";
import type { MusicPreferences } from "@/types/music";

function clampVolume(value: number): number {
  if (Number.isNaN(value)) return MUSIC_DEFAULT_PREFERENCES.volume;
  return Math.min(1, Math.max(0, value));
}

export function loadMusicPreferences(): MusicPreferences {
  if (typeof window === "undefined") {
    return { ...MUSIC_DEFAULT_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(MUSIC_STORAGE_KEY);
    if (!raw) return { ...MUSIC_DEFAULT_PREFERENCES };

    const parsed = JSON.parse(raw) as Partial<MusicPreferences>;
    return {
      volume: clampVolume(
        typeof parsed.volume === "number"
          ? parsed.volume
          : MUSIC_DEFAULT_PREFERENCES.volume,
      ),
      muted:
        typeof parsed.muted === "boolean"
          ? parsed.muted
          : MUSIC_DEFAULT_PREFERENCES.muted,
      playing:
        typeof parsed.playing === "boolean"
          ? parsed.playing
          : MUSIC_DEFAULT_PREFERENCES.playing,
    };
  } catch {
    return { ...MUSIC_DEFAULT_PREFERENCES };
  }
}

export function saveMusicPreferences(prefs: MusicPreferences): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      MUSIC_STORAGE_KEY,
      JSON.stringify({
        volume: clampVolume(prefs.volume),
        muted: prefs.muted,
        playing: prefs.playing,
      }),
    );
  } catch {
    // Quota / private mode — ignore
  }
}
