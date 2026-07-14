import { MUSIC_FADE_MS } from "@/data/music";
import { cancelAudioFade, fadeAudioVolume } from "@/lib/music/fade";
import type { MusicTrack } from "@/types/music";

/**
 * Low-level audio transport — UI talks to MusicProvider, not this class.
 * Swap tracks via `loadTrack` without rebuilding controls.
 */
export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private targetVolume = 0.45;
  private muted = false;
  private fadeMs = MUSIC_FADE_MS;

  constructor(fadeMs = MUSIC_FADE_MS) {
    this.fadeMs = fadeMs;
  }

  get element(): HTMLAudioElement | null {
    return this.audio;
  }

  ensure(track: MusicTrack): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.crossOrigin = "anonymous";
    }

    const nextSrc = track.src;
    if (this.audio.dataset.trackSrc !== nextSrc) {
      this.audio.dataset.trackSrc = nextSrc;
      this.audio.src = nextSrc;
      this.audio.loop = track.loop ?? true;
      this.audio.load();
    }

    return this.audio;
  }

  setGain(volume: number, muted: boolean): void {
    this.targetVolume = Math.min(1, Math.max(0, volume));
    this.muted = muted;

    if (!this.audio || this.audio.paused) return;

    const effective = muted ? 0 : this.targetVolume;
    cancelAudioFade(this.audio);
    this.audio.volume = effective;
  }

  async play(options?: { fade?: boolean }): Promise<boolean> {
    if (!this.audio) return false;

    const fade = options?.fade ?? true;
    const effective = this.muted ? 0 : this.targetVolume;

    cancelAudioFade(this.audio);
    this.audio.volume = fade ? 0 : effective;

    try {
      await this.audio.play();
    } catch {
      // Autoplay / missing file — caller handles unlocked UI state
      return false;
    }

    if (fade && effective > 0) {
      await fadeAudioVolume(this.audio, effective, this.fadeMs);
    } else {
      this.audio.volume = effective;
    }

    return true;
  }

  async pause(options?: { fade?: boolean }): Promise<void> {
    if (!this.audio || this.audio.paused) return;

    const fade = options?.fade ?? true;

    if (fade && this.audio.volume > 0) {
      await fadeAudioVolume(this.audio, 0, this.fadeMs);
    } else {
      cancelAudioFade(this.audio);
      this.audio.volume = 0;
    }

    this.audio.pause();
  }

  destroy(): void {
    if (!this.audio) return;
    cancelAudioFade(this.audio);
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.audio = null;
  }
}
