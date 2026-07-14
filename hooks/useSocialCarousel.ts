import { useCallback, useMemo, useState } from "react";

/**
 * Shortest signed offset from active index → card index on a circular ring.
 * Example (n=6, active=0): indices map to 0, 1, 2, -3, -2, -1
 */
export function getCircularOffset(
  index: number,
  activeIndex: number,
  length: number,
): number {
  if (length <= 0) return 0;

  let diff = (index - activeIndex) % length;
  if (diff < 0) diff += length;
  if (diff > length / 2) diff -= length;
  return diff;
}

export type UseSocialCarouselOptions = {
  length: number;
  /** Initial active card index */
  initialIndex?: number;
};

export type UseSocialCarouselResult = {
  activeIndex: number;
  length: number;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Normalized circular offsets for every card */
  offsets: number[];
};

/**
 * Data-agnostic infinite carousel state.
 * Keeps a single source of truth for active index + wrap math.
 */
export function useSocialCarousel({
  length,
  initialIndex = 0,
}: UseSocialCarouselOptions): UseSocialCarouselResult {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (length <= 0) return 0;
    return ((initialIndex % length) + length) % length;
  });

  const goTo = useCallback(
    (index: number) => {
      if (length <= 0) return;
      setActiveIndex(((index % length) + length) % length);
    },
    [length],
  );

  const next = useCallback(() => {
    if (length <= 0) return;
    setActiveIndex((current) => (current + 1) % length);
  }, [length]);

  const prev = useCallback(() => {
    if (length <= 0) return;
    setActiveIndex((current) => (current - 1 + length) % length);
  }, [length]);

  const offsets = useMemo(
    () =>
      Array.from({ length }, (_, index) =>
        getCircularOffset(index, activeIndex, length),
      ),
    [activeIndex, length],
  );

  return { activeIndex, length, goTo, next, prev, offsets };
}
