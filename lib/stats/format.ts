/**
 * Compact display formatting for large counters.
 * Keep presentation logic out of cards.
 */
export function formatStatNumber(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return trimDecimal(value / 1_000_000_000) + "B";
  }
  if (abs >= 1_000_000) {
    return trimDecimal(value / 1_000_000) + "M";
  }
  if (abs >= 10_000) {
    return trimDecimal(value / 1_000) + "K";
  }
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * Visitor display — exact below 1K; compact K/M/B+ from 1K (same scale rules as stats).
 */
export function formatVisitorCount(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${trimDecimal(value / 1_000_000_000)}B+`;
  }
  if (abs >= 1_000_000) {
    return `${trimDecimal(value / 1_000_000)}M+`;
  }
  if (abs >= 1_000) {
    return `${trimDecimal(value / 1_000)}K+`;
  }
  return String(Math.round(value));
}

function trimDecimal(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
