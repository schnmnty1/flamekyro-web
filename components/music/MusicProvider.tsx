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
import { DEFAULT_MUSIC_TRACK, MUSIC_FADE_MS } from "@/data/music";
import { usePrefersReducedMotion } from "@/hooks";
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
 * Optional ambient music — never autoplays.
 * UI lives in Hero; this provider only owns playback state.
 */
export function MusicProvider({
  children,
  track = DEFAULT_MUSIC_TRACK,
  fadeMs,
}: MusicProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const resolvedFadeMs =
    fadeMs ?? (prefersReducedMotion ? 0 : MUSIC_FADE_MS);

  const engineRef = useRef<AudioEngine | null>(null);

  const [available, setAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.18);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    engineRef.current = new AudioEngine(resolvedFadeMs);
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [resolvedFadeMs]);

  useEffect(() => {
    let cancelled = false;
    const probe = new Audio();
    probe.preload = "metadata";

    const markOk = () => {
      if (!cancelled) setAvailable(true);
    };
    const markFail = () => {
      if (!cancelled) setAvailable(false);
    };

    probe.addEventListener("canplaythrough", markOk);
    probe.addEventListener("loadedmetadata", markOk);
    probe.addEventListener("error", markFail);
    probe.src = track.src;

    return () => {
      cancelled = true;
      probe.removeEventListener("canplaythrough", markOk);
      probe.removeEventListener("loadedmetadata", markOk);
      probe.removeEventListener("error", markFail);
      probe.removeAttribute("src");
      probe.load();
    };
  }, [track.src]);

  useEffect(() => {
    const prefs = loadMusicPreferences();
    setVolumeState(prefs.volume);
    setIsMuted(prefs.muted);
    // Never restore playback on load — explicit Play only
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
    if (!engine || !available) return;

    engine.ensure(track);
    engine.setGain(volume, isMuted);
    const started = await engine.play({ fade: !prefersReducedMotion });
    setIsPlaying(started);
  }, [track, volume, isMuted, available, prefersReducedMotion]);

  const pause = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    await engine.pause({ fade: !prefersReducedMotion });
    setIsPlaying(false);
  }, [prefersReducedMotion]);

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

  const value = useMemo<MusicContextValue>(
    () => ({
      available,
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
      available,
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
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}
