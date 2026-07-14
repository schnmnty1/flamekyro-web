/**
 * Videos section copy + layout slots.
 * Content comes from the YouTube adapter — never fabricated locally.
 */
export const VIDEOS_SECTION = {
  heading: "LATEST VIDEOS",
  subtitle: "Latest uploads from FlameKyro",
  connectingLabel: "Connecting to YouTube…",
  errorLabel: "Unable to load YouTube data. Try again later.",
  /** Preserve the 3-card grid rhythm while pending */
  skeletonCount: 3,
} as const;

/** Destination for the section CTA — real channel link */
export const VIDEOS_INDEX_URL = "https://www.youtube.com/@FlameKyro";
