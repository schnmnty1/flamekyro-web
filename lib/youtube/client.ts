import type { YouTubeApiPayload } from "@/types/youtube";

/**
 * Browser-side fetch of `/api/youtube` with in-flight deduplication.
 * Stats + videos adapters share one network round-trip on cold load.
 * Polling may pass AbortSignal (skips the shared inflight lock).
 */

const ENDPOINT = "/api/youtube";

let inflight: Promise<YouTubeApiPayload> | null = null;

export class YouTubeClientError extends Error {
  constructor(message = "Unable to load YouTube data. Try again later.") {
    super(message);
    this.name = "YouTubeClientError";
  }
}

export type FetchYouTubeOptions = {
  signal?: AbortSignal;
};

export async function fetchYouTubeFromApi(
  options?: FetchYouTubeOptions,
): Promise<YouTubeApiPayload> {
  const signal = options?.signal;

  if (!signal && inflight) return inflight;

  const request = (async () => {
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!response.ok) {
      throw new YouTubeClientError();
    }

    return (await response.json()) as YouTubeApiPayload;
  })();

  if (!signal) {
    inflight = request.finally(() => {
      inflight = null;
    });
    return inflight;
  }

  return request;
}
