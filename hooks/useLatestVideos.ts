"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLatestVideos } from "@/lib/videos/adapters";
import { YouTubeClientError } from "@/lib/youtube/client";
import type { VideoItem, VideosSource, VideosSnapshot } from "@/types/video";

type UseLatestVideosResult = {
  videos: VideoItem[];
  fetchedAt: string | null;
  source: VideosSource;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const ERROR_MESSAGE = "Unable to load YouTube data. Try again later.";

/**
 * Loads latest videos through the active adapter (YouTube by default).
 */
export function useLatestVideos(): UseLatestVideosResult {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [source, setSource] = useState<VideosSource>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot: VideosSnapshot = await fetchLatestVideos();
      setVideos([...snapshot.videos]);
      setFetchedAt(snapshot.fetchedAt);
      setSource(snapshot.source);
      setLoading(snapshot.source !== "live");
    } catch (err) {
      setError(
        err instanceof YouTubeClientError ? err.message : ERROR_MESSAGE,
      );
      setSource("pending");
      setVideos([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { videos, fetchedAt, source, loading, error, reload };
}
