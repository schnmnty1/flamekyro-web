/** Music track + preference contracts */

export type MusicTrack = {
  id: string;
  title: string;
  /** Public path or absolute URL — swap files here without touching UI */
  src: string;
  loop?: boolean;
};

export type MusicPreferences = {
  volume: number;
  muted: boolean;
  /** Last known play intent — never used to autoplay on load */
  playing: boolean;
};

export type MusicContextValue = {
  /** False when the theme file is missing or unreachable */
  available: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  track: MusicTrack;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
};
