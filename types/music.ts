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
  playing: boolean;
};

export type MusicContextValue = {
  /** True after first user gesture unlocked audio */
  unlocked: boolean;
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
