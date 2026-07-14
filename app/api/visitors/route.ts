import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getVisitorStore } from "@/lib/visitors/store";
import type { VisitorCountSnapshot, VisitorMetrics } from "@/types/visitors";

const COOKIE_NAME = "fk_visitor";
/** Unique visitor window — 30 days */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const dynamic = "force-dynamic";

const BOT_UA =
  /bot|crawler|spider|crawling|preview|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|rogerbot|showyoubot|outbrain|pinterest\/0\.|redditbot|payload|whatsapp|telegram|discordbot|skypeuripreview|applebot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|google-extended|amazonbot|yandex|baidu|duckduckbot|ia_archiver|wget|curl|python-requests|httpclient|go-http-client|libwww|scrapy|headlesschrome|phantomjs|selenium|puppeteer|playwright/i;

const HEALTH_UA = /health[\s-_]?check|kube-probe|readyz|livez|uptime|pingdom|statuscake|betteruptime|vercel-favicon/i;

function snapshot(
  metrics: VisitorMetrics,
  recorded: boolean,
): VisitorCountSnapshot {
  return {
    count: metrics.uniqueVisitors,
    uniqueVisitors: metrics.uniqueVisitors,
    totalVisits: metrics.totalVisits,
    recorded,
    fetchedAt: new Date().toISOString(),
  };
}

function isBotOrHealthCheck(userAgent: string | null, purpose: string | null): boolean {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return true;
  if (BOT_UA.test(ua)) return true;
  if (HEALTH_UA.test(ua)) return true;
  // RFC 9110 / Common Prefetch — skip prefetch / health-style probes
  if (purpose === "prefetch" || purpose === "preview") return true;
  return false;
}

/**
 * GET — current metrics (read-only). Display uses unique visitors as `count`.
 */
export async function GET() {
  try {
    const metrics = await getVisitorStore().getMetrics();
    return NextResponse.json(snapshot(metrics, false));
  } catch (error) {
    console.error("[api/visitors]", error);
    return NextResponse.json(
      { error: "Unable to load visitor count." },
      { status: 502 },
    );
  }
}

/**
 * POST — record visit.
 * Unique + cookie only when no valid 30-day cookie and request is a real visitor.
 * Total visits increment for every eligible (non-bot / non-health) request.
 */
export async function POST() {
  try {
    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent");
    const purpose =
      headerStore.get("purpose") ??
      headerStore.get("sec-purpose") ??
      headerStore.get("x-purpose");

    if (isBotOrHealthCheck(userAgent, purpose)) {
      const metrics = await getVisitorStore().getMetrics();
      return NextResponse.json(snapshot(metrics, false));
    }

    const store = getVisitorStore();
    const jar = await cookies();
    const hasValidCookie = jar.get(COOKIE_NAME)?.value === "1";

    let metrics: VisitorMetrics;
    let recorded = false;

    if (hasValidCookie) {
      // Returning visitor within 30 days — count the visit, not a new unique
      metrics = await store.incrementTotal();
    } else {
      metrics = await store.incrementBoth();
      recorded = true;
    }

    const response = NextResponse.json(snapshot(metrics, recorded));

    if (!hasValidCookie) {
      response.cookies.set(COOKIE_NAME, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error("[api/visitors]", error);
    return NextResponse.json(
      { error: "Unable to record visitor." },
      { status: 502 },
    );
  }
}
