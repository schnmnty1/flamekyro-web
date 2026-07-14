"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  STATS_REFRESH_INTERVAL_IDLE_MS,
  STATS_REFRESH_INTERVAL_MS,
  STATS_STALE_STREAK_BEFORE_IDLE,
} from "@/data/stats";
import { fetchCreatorStats } from "@/lib/stats/adapters";
import { YouTubeClientError } from "@/lib/youtube/client";
import type {
  CreatorStatsSource,
  CreatorStatsSnapshot,
  StatCardModel,
} from "@/types/stats";

type UseCreatorStatsResult = {
  stats: StatCardModel[];
  fetchedAt: string | null;
  source: CreatorStatsSource;
  /** True only before the first successful (or failed) initial attempt */
  loading: boolean;
  /** Set only when the first load fails with no prior values */
  error: string | null;
  reload: () => Promise<void>;
};

type ApplyResult = {
  applied: boolean;
  valuesChanged: boolean;
};

const ERROR_MESSAGE = "Unable to load YouTube data. Try again later.";

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function didValuesChange(
  previous: StatCardModel[],
  next: readonly StatCardModel[],
): boolean {
  if (previous.length === 0) return next.length > 0;

  const prevById = new Map(previous.map((card) => [card.id, card]));

  for (const card of next) {
    const prior = prevById.get(card.id);
    if (!prior || prior.value !== card.value) return true;
  }

  return false;
}

/**
 * Stale-while-revalidate merge — keep prior cards visible; replace only on
 * success; preserve object identity when a metric is unchanged.
 */
function mergeStats(
  previous: StatCardModel[],
  next: readonly StatCardModel[],
): StatCardModel[] {
  if (previous.length === 0) return [...next];

  const prevById = new Map(previous.map((card) => [card.id, card]));

  return next.map((card) => {
    const prior = prevById.get(card.id);
    if (
      prior &&
      prior.value === card.value &&
      prior.status === card.status &&
      prior.displayValue === card.displayValue &&
      prior.errorMessage === card.errorMessage
    ) {
      return prior;
    }
    return card;
  });
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = window.setTimeout(() => resolve(), ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function waitUntilVisible(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    if (typeof document === "undefined" || !document.hidden) {
      resolve();
      return;
    }

    const onVisibility = () => {
      if (!document.hidden) {
        cleanup();
        resolve();
      }
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    const cleanup = () => {
      document.removeEventListener("visibilitychange", onVisibility);
      signal.removeEventListener("abort", onAbort);
    };

    document.addEventListener("visibilitychange", onVisibility);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Live Creator Stats — SWR background refresh + adaptive polling.
 * Numbers stay on screen; odometer runs only after a successful value change.
 */
export function useCreatorStats(): UseCreatorStatsResult {
  const [stats, setStats] = useState<StatCardModel[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [source, setSource] = useState<CreatorStatsSource>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statsRef = useRef<StatCardModel[]>([]);
  const hasLiveRef = useRef(false);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const intervalMsRef = useRef(STATS_REFRESH_INTERVAL_MS);
  const staleStreakRef = useRef(0);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const applySnapshot = useCallback(
    (snapshot: CreatorStatsSnapshot): ApplyResult => {
      if (snapshot.source !== "live") {
        return { applied: false, valuesChanged: false };
      }

      const previous = statsRef.current;
      const valuesChanged = didValuesChange(previous, snapshot.stats);
      const merged = mergeStats(previous, snapshot.stats);

      // Commit only after a successful payload — never blank mid-flight
      setStats(merged);
      statsRef.current = merged;
      setFetchedAt(snapshot.fetchedAt);
      setSource("live");
      setError(null);
      setLoading(false);
      hasLiveRef.current = true;

      return { applied: true, valuesChanged };
    },
    [],
  );

  const notePollResult = useCallback((result: ApplyResult) => {
    if (!result.applied) return;

    if (result.valuesChanged) {
      staleStreakRef.current = 0;
      intervalMsRef.current = STATS_REFRESH_INTERVAL_MS;
      return;
    }

    staleStreakRef.current += 1;
    if (staleStreakRef.current >= STATS_STALE_STREAK_BEFORE_IDLE) {
      intervalMsRef.current = STATS_REFRESH_INTERVAL_IDLE_MS;
    }
  }, []);

  const fetchOnce = useCallback(async (): Promise<ApplyResult> => {
    if (inFlightRef.current) {
      return { applied: false, valuesChanged: false };
    }
    if (typeof document !== "undefined" && document.hidden) {
      return { applied: false, valuesChanged: false };
    }

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    inFlightRef.current = true;

    const onHiddenAbort = () => {
      if (document.hidden) controller.abort();
    };
    document.addEventListener("visibilitychange", onHiddenAbort);

    try {
      const snapshot = await fetchCreatorStats({ signal: controller.signal });
      if (controller.signal.aborted) {
        return { applied: false, valuesChanged: false };
      }

      const result = applySnapshot(snapshot);
      notePollResult(result);
      return result;
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) {
        return { applied: false, valuesChanged: false };
      }

      // SWR: keep stale numbers; surface error only before first success
      if (!hasLiveRef.current) {
        setError(
          err instanceof YouTubeClientError ? err.message : ERROR_MESSAGE,
        );
        setSource("pending");
        setLoading(false);
      }

      return { applied: false, valuesChanged: false };
    } finally {
      document.removeEventListener("visibilitychange", onHiddenAbort);
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
      }
      inFlightRef.current = false;
    }
  }, [applySnapshot, notePollResult]);

  const reload = useCallback(async () => {
    // Never flash loading after the initial successful load
    if (!hasLiveRef.current) {
      setLoading(true);
      setError(null);
    }
    await fetchOnce();
  }, [fetchOnce]);

  useEffect(() => {
    let stopped = false;
    const loopController = new AbortController();

    const run = async () => {
      while (!stopped) {
        try {
          await waitUntilVisible(loopController.signal);
          if (stopped) break;

          await fetchOnce();
          if (stopped) break;

          const sleepController = new AbortController();
          const onHide = () => {
            if (document.hidden) sleepController.abort();
          };
          document.addEventListener("visibilitychange", onHide);

          try {
            await wait(intervalMsRef.current, sleepController.signal);
          } catch (err) {
            if (!isAbortError(err)) throw err;
          } finally {
            document.removeEventListener("visibilitychange", onHide);
          }
        } catch (err) {
          if (stopped || isAbortError(err)) break;
          try {
            await wait(intervalMsRef.current, loopController.signal);
          } catch {
            break;
          }
        }
      }
    };

    void run();

    return () => {
      stopped = true;
      loopController.abort();
      fetchControllerRef.current?.abort();
    };
  }, [fetchOnce]);

  return { stats, fetchedAt, source, loading, error, reload };
}
