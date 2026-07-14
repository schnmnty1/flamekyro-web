/**
 * Achievement milestone helpers — derived from live channel metrics only.
 * Never invents future / unearned thresholds.
 */

export type AchievementItem = {
  id: string;
  icon: string;
  value: string;
  label: string;
};

/**
 * Highest completed step for a raw count.
 * Steps scale with magnitude so we land on values like 700 / 800 / 1K / 700K / 1.2M.
 */
export function highestCompletedMilestone(count: number): number | null {
  if (!Number.isFinite(count) || count < 100) return null;

  let step: number;
  if (count < 1_000) step = 100;
  else if (count < 10_000) step = 1_000;
  else if (count < 100_000) step = 10_000;
  else if (count < 10_000_000) step = 100_000;
  else if (count < 100_000_000) step = 1_000_000;
  else step = 10_000_000;

  const milestone = Math.floor(count / step) * step;
  return milestone > 0 ? milestone : null;
}

/** Format a milestone integer as 700 / 1K / 700K / 1.2M (no trailing +). */
export function formatMilestoneNumber(milestone: number): string {
  if (milestone >= 1_000_000) {
    return `${trimDecimal(milestone / 1_000_000)}M`;
  }
  if (milestone >= 1_000) {
    return `${trimDecimal(milestone / 1_000)}K`;
  }
  return String(Math.round(milestone));
}

export function formatSubscriberAchievement(
  subscriberCount: number,
): Omit<AchievementItem, "id" | "icon"> | null {
  const milestone = highestCompletedMilestone(subscriberCount);
  if (milestone === null) return null;

  return {
    value: `${formatMilestoneNumber(milestone)}+`,
    label: "Subscribers",
  };
}

export function formatViewsAchievement(
  viewCount: number,
): Omit<AchievementItem, "id" | "icon"> | null {
  const milestone = highestCompletedMilestone(viewCount);
  if (milestone === null) return null;

  return {
    value: `${formatMilestoneNumber(milestone)}+`,
    label: "Views",
  };
}

export function formatVideosAchievement(
  videoCount: number,
): Omit<AchievementItem, "id" | "icon"> | null {
  if (!Number.isFinite(videoCount) || videoCount < 0) return null;

  return {
    value: new Intl.NumberFormat("en-US", { useGrouping: false }).format(
      Math.round(videoCount),
    ),
    label: "Videos",
  };
}

/**
 * Fallback when video count is unavailable — Streaming Since <year>.
 */
export function formatStreamingSinceAchievement(
  publishedAt: string | null | undefined,
): Omit<AchievementItem, "id" | "icon"> | null {
  const year = extractChannelYear(publishedAt);
  if (year === null) return null;

  return {
    value: String(year),
    label: "Streaming Since",
  };
}

function extractChannelYear(
  publishedAt: string | null | undefined,
): number | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  if (year < 2005 || year > new Date().getUTCFullYear()) return null;
  return year;
}

function trimDecimal(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
