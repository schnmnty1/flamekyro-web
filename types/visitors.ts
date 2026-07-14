/** Visitor counter domain — UI-agnostic, store-backed */

export type VisitorMetrics = {
  /** Cookie-gated unique visitors (30-day window) */
  uniqueVisitors: number;
  /** All eligible page visits (non-bot, non-health) */
  totalVisits: number;
};

export type VisitorCountSnapshot = {
  /**
   * Display count — unique visitors.
   * Kept as `count` so the existing Website Visitors UI stays unchanged.
   */
  count: number;
  uniqueVisitors: number;
  totalVisits: number;
  /** Whether this request counted a new unique visitor */
  recorded: boolean;
  /**
   * Why recording was skipped (null when a new unique was recorded).
   * existing_cookie still increments totalVisits.
   */
  skipReason?:
    | "existing_cookie"
    | "bot_detection"
    | "empty_user_agent"
    | "prefetch_request"
    | "preview_request"
    | "health_check"
    | null;
  fetchedAt: string;
};

/** Persistence contract — Redis in production; file store in development only */
export type VisitorStore = {
  getMetrics: () => Promise<VisitorMetrics>;
  /** +1 unique visitors */
  incrementUnique: () => Promise<VisitorMetrics>;
  /** +1 total visits */
  incrementTotal: () => Promise<VisitorMetrics>;
  /** +1 unique and +1 total in one step (first-time visitor) */
  incrementBoth: () => Promise<VisitorMetrics>;
};
