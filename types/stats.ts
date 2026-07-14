/** Creator stats domain models — UI-agnostic, API-ready */

export type StatIconId =
  | "youtube"
  | "instagram"
  | "facebook"
  | "videos"
  | "views"
  | "live";

export type StatTrendDirection = "up" | "down" | "flat";

export type StatTrend = {
  direction: StatTrendDirection;
  /** Human label e.g. "+12%" — only set from real API payloads */
  label: string;
};

export type StatStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "live"
  | "offline";

/**
 * Fully resolved card model consumed by StatCard.
 * Numeric fields must come from a live adapter — never fabricate them in UI.
 */
export type StatCardModel = {
  id: string;
  title: string;
  /** Numeric target for counters; null while pending / non-numeric */
  value: number | null;
  /** Preformatted display when value is null or for custom strings */
  displayValue?: string;
  subtitle: string;
  icon: StatIconId;
  /** Accent hex used for glow / icon tint */
  accent: string;
  trend?: StatTrend;
  status: StatStatus;
  /** Optional error message when status === "error" */
  errorMessage?: string;
  /** Animate as a counting number when true and value is numeric */
  animateValue?: boolean;
  /** Suffix appended after animated value e.g. "K", "M" */
  valueSuffix?: string;
  /** Prefix e.g. "#" */
  valuePrefix?: string;
};

/** Card chrome without metrics — safe to ship without live APIs */
export type StatCardDefinition = Pick<
  StatCardModel,
  "id" | "title" | "subtitle" | "icon" | "accent"
>;

export type CreatorStatsSource = "pending" | "live";

export type CreatorStatsSnapshot = {
  fetchedAt: string | null;
  /** pending = no trusted metrics yet; live = adapter returned real values */
  source: CreatorStatsSource;
  stats: readonly StatCardModel[];
};

/** Future API adapter contract */
export type CreatorStatsAdapter = {
  fetchStats: (options?: {
    signal?: AbortSignal;
  }) => Promise<CreatorStatsSnapshot>;
};
