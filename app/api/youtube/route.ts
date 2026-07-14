import { NextResponse } from "next/server";
import { YOUTUBE_CACHE_SECONDS } from "@/data/youtube";
import { fetchYouTubeBundle } from "@/lib/youtube/server";

/** Cache YouTube aggregation for 10 minutes (literal required by Next.js) */
export const revalidate = 600;

/**
 * Server proxy for YouTube Data API.
 * Keeps YOUTUBE_API_KEY off the client.
 */
export async function GET() {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 503 },
      );
    }

    const payload = await fetchYouTubeBundle();

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": `s-maxage=${YOUTUBE_CACHE_SECONDS}, stale-while-revalidate=${YOUTUBE_CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("[api/youtube]", error);
    return NextResponse.json(
      { error: "Unable to load YouTube data. Try again later." },
      { status: 502 },
    );
  }
}
