"use client";

import { useCallback, useEffect, useState } from "react";
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
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const ERROR_MESSAGE = "Unable to load YouTube data. Try again later.";

/**
 * Loads creator stats through the active adapter (YouTube by default).
 */
export function useCreatorStats(): UseCreatorStatsResult {
  const [stats, setStats] = useState<StatCardModel[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [source, setSource] = useState<CreatorStatsSource>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot: CreatorStatsSnapshot = await fetchCreatorStats();
      setStats([...snapshot.stats]);
      setFetchedAt(snapshot.fetchedAt);
      setSource(snapshot.source);
      setLoading(snapshot.source !== "live");
    } catch (err) {
      setError(
        err instanceof YouTubeClientError ? err.message : ERROR_MESSAGE,
      );
      setSource("pending");
      setStats([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, fetchedAt, source, loading, error, reload };
}
