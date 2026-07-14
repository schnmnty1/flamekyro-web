"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MusicContext } from "@/components/music/context";
import { MusicController } from "@/components/music/MusicController";
import { MusicHint } from "@/components/music/MusicHint";
import { DEFAULT_MUSIC_TRACK, MUSIC_FADE_MS } from "@/data/music";
import { AudioEngine } from "@/lib/music/engine";
import {
  loadMusicPreferences,
  saveMusicPreferences,
} from "@/lib/music/storage";
import type { MusicContextValue, MusicTrack } from "@/types/music";

type MusicProviderProps = {
  children: ReactNode;
  /** Override default track without changing provider internals */
  track?: MusicTrack;
  fadeMs?: number;
};

/**
 * Site-wide music shell — survives client navigations when mounted in Providers.
 * Unlock requires a real user gesture (click / tap / key).
 */
export function MusicProvider({
  children,
  track = DEFAULT_MUSIC_TRACK,
  fadeMs = MUSIC_FADE_MS,
}: MusicProviderProps) {
  const engineRef = useRef<AudioEngine | null>(null);
  const unlockingRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.45);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    engineRef.current = new AudioEngine(fadeMs);
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [fadeMs]);

  useEffect(() => {
    const prefs = loadMusicPreferences();
    setVolumeState(prefs.volume);
    setIsMuted(prefs.muted);
    setIsPlaying(false);
    setHydrated(true);
    engineRef.current?.setGain(prefs.volume, prefs.muted);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveMusicPreferences({
      volume,
      muted: isMuted,
      playing: isPlaying,
    });
  }, [hydrated, volume, isMuted, isPlaying]);

  const play = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.ensure(track);
    engine.setGain(volume, isMuted);
    const started = await engine.play({ fade: true });
    setIsPlaying(started);
  }, [track, volume, isMuted]);

  const pause = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    await engine.pause({ fade: true });
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) await pause();
    else await play();
  }, [isPlaying, pause, play]);

  const setMuted = useCallback(
    (muted: boolean) => {
      setIsMuted(muted);
      engineRef.current?.setGain(volume, muted);
    },
    [volume],
  );

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);

    if (clamped === 0) {
      setIsMuted(true);
      engineRef.current?.setGain(0, true);
      return;
    }

    setIsMuted(false);
    engineRef.current?.setGain(clamped, false);
  }, []);

  const unlockAndMaybePlay = useCallback(async () => {
    if (unlockingRef.current || unlocked) return;
    unlockingRef.current = true;

    const prefs = loadMusicPreferences();
    const engine = engineRef.current;
    if (!engine) {
      unlockingRef.current = false;
      return;
    }

    engine.ensure(track);
    engine.setGain(prefs.volume, prefs.muted);
    setVolumeState(prefs.volume);
    setIsMuted(prefs.muted);
    setUnlocked(true);

    if (prefs.playing) {
      const started = await engine.play({ fade: true });
      setIsPlaying(started);
    }

    unlockingRef.current = false;
  }, [track, unlocked]);

  useEffect(() => {
    if (!hydrated || unlocked) return;

    const onGesture = (event: Event) => {
      if (event.type === "keydown") {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey) return;
        if (
          keyEvent.key === "Shift" ||
          keyEvent.key === "Tab" ||
          keyEvent.key === "Meta" ||
          keyEvent.key === "Control" ||
          keyEvent.key === "Alt"
        ) {
          return;
        }
      }
      void unlockAndMaybePlay();
    };

    window.addEventListener("pointerdown", onGesture, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", onGesture, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
    };
  }, [hydrated, unlocked, unlockAndMaybePlay]);

  const value = useMemo<MusicContextValue>(
    () => ({
      unlocked,
      isPlaying,
      isMuted,
      volume,
      track,
      play,
      pause,
      togglePlay,
      setMuted,
      toggleMute,
      setVolume,
    }),
    [
      unlocked,
      isPlaying,
      isMuted,
      volume,
      track,
      play,
      pause,
      togglePlay,
      setMuted,
      toggleMute,
      setVolume,
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <MusicHint />
      <MusicController />
    </MusicContext.Provider>
  );
}
