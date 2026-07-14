import type { YouTubeApiPayload } from "@/types/youtube";

/**
 * Browser-side fetch of `/api/youtube` with in-flight deduplication.
 * Stats + videos adapters share one network round-trip.
 */

const ENDPOINT = "/api/youtube";

let inflight: Promise<YouTubeApiPayload> | null = null;

export class YouTubeClientError extends Error {
  constructor(message = "Unable to load YouTube data. Try again later.") {
    super(message);
    this.name = "YouTubeClientError";
  }
}

export async function fetchYouTubeFromApi(): Promise<YouTubeApiPayload> {
  if (inflight) return inflight;

  inflight = (async () => {
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new YouTubeClientError();
    }

    return (await response.json()) as YouTubeApiPayload;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}
