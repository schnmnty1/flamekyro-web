import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getVisitorStore } from "@/lib/visitors/store";
import type { VisitorCountSnapshot, VisitorMetrics } from "@/types/visitors";

const COOKIE_NAME = "fk_visitor";
/** Unique visitor window — 30 days */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Word-boundary bot tokens — avoid substring false positives (e.g. bare "bot"). */
const BOT_UA =
  /\b(googlebot|bingbot|yandexbot|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|amazonbot|rogerbot|showyoubot|redditbot|ia_archiver|gptbot|anthropic|google-extended|headlesschrome|phantomjs|selenium|puppeteer|playwright|scrapy|wget|curl|python-requests|go-http-client|libwww-perl)\b/i;

const HEALTH_UA =
  /\b(health[\s-_]?check|kube-probe|readyz|livez|pingdom|statuscake|betteruptime|vercel-favicon)\b/i;

type SkipReason =
  | "existing_cookie"
  | "bot_detection"
  | "empty_user_agent"
  | "prefetch_request"
  | "preview_request"
  | "health_check";

function snapshot(
  metrics: VisitorMetrics,
  recorded: boolean,
  skipReason: SkipReason | null = null,
): VisitorCountSnapshot & { skipReason: SkipReason | null } {
  return {
    count: metrics.uniqueVisitors,
    uniqueVisitors: metrics.uniqueVisitors,
    totalVisits: metrics.totalVisits,
    recorded,
    skipReason,
    fetchedAt: new Date().toISOString(),
  };
}

function logSkip(reason: SkipReason, detail: Record<string, string | null>) {
  console.info("[api/visitors] skip", { reason, ...detail });
}

/**
 * Classify non-human / non-page traffic.
 * Homepage hook sends X-FK-Visit: 1 — trust that over sparse UA, still block known bots.
 */
function getTrafficSkipReason(input: {
  userAgent: string | null;
  purpose: string | null;
  secFetchSite: string | null;
  secFetchMode: string | null;
  intentionalVisit: boolean;
}): Exclude<SkipReason, "existing_cookie"> | null {
  const purposeNorm = input.purpose?.trim().toLowerCase() ?? "";
  if (purposeNorm === "prefetch") return "prefetch_request";
  if (purposeNorm === "preview") return "preview_request";

  const ua = input.userAgent?.trim() ?? "";

  if (ua && HEALTH_UA.test(ua)) return "health_check";
  if (ua && BOT_UA.test(ua)) return "bot_detection";

  if (!ua) {
    // Our homepage POST always marks intentional visits.
    if (input.intentionalVisit) return null;
    const sameOriginBrowserFetch =
      input.secFetchSite === "same-origin" && input.secFetchMode === "cors";
    if (!sameOriginBrowserFetch) return "empty_user_agent";
  }

  return null;
}

/**
 * GET — current metrics (read-only). Display uses unique visitors as `count`.
 * Does not record visits — homepage uses POST.
 */
export async function GET() {
  try {
    const metrics = await getVisitorStore().getMetrics();
    return NextResponse.json(snapshot(metrics, false, null));
  } catch (error) {
    console.error("[api/visitors]", error);
    return NextResponse.json(
      { error: "Unable to load visitor count." },
      { status: 502 },
    );
  }
}

/**
 * POST — record visit (called automatically from the homepage).
 * First visit (no cookie): +1 unique, +1 total, recorded=true, set cookie.
 * Return visit (cookie): +1 total only, recorded=false.
 */
export async function POST() {
  try {
    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent");
    const purpose =
      headerStore.get("purpose") ??
      headerStore.get("sec-purpose") ??
      headerStore.get("x-purpose");
    const secFetchSite = headerStore.get("sec-fetch-site");
    const secFetchMode = headerStore.get("sec-fetch-mode");
    const intentionalVisit = headerStore.get("x-fk-visit") === "1";

    const trafficSkip = getTrafficSkipReason({
      userAgent,
      purpose,
      secFetchSite,
      secFetchMode,
      intentionalVisit,
    });

    if (trafficSkip) {
      logSkip(trafficSkip, {
        userAgent,
        purpose,
        secFetchSite,
        secFetchMode,
        intentionalVisit: intentionalVisit ? "1" : "0",
      });
      const metrics = await getVisitorStore().getMetrics();
      return NextResponse.json(snapshot(metrics, false, trafficSkip));
    }

    const store = getVisitorStore();
    const jar = await cookies();
    const hasValidCookie = jar.get(COOKIE_NAME)?.value === "1";

    let metrics: VisitorMetrics;
    let recorded = false;
    let skipReason: SkipReason | null = null;

    if (hasValidCookie) {
      // Returning visitor within 30 days — count the visit, not a new unique
      metrics = await store.incrementTotal();
      recorded = false;
      skipReason = "existing_cookie";
      logSkip("existing_cookie", { userAgent, purpose });
    } else {
      metrics = await store.incrementBoth();
      recorded = true;
      console.info("[api/visitors] recorded", {
        uniqueVisitors: metrics.uniqueVisitors,
        totalVisits: metrics.totalVisits,
      });
    }

    const response = NextResponse.json(
      snapshot(metrics, recorded, skipReason),
    );

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
