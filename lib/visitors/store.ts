import { promises as fs } from "node:fs";
import path from "node:path";
import type { VisitorMetrics, VisitorStore } from "@/types/visitors";

const UNIQUE_KEY = "flamekyro:visitors:unique";
const TOTAL_KEY = "flamekyro:visitors:total";

function toCount(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/**
 * Upstash Redis REST — required in production.
 * Configure UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 */
function createUpstashStore(url: string, token: string): VisitorStore {
  const base = url.replace(/\/$/, "");

  async function command(parts: string[]): Promise<unknown> {
    const response = await fetch(
      `${base}/${parts.map(encodeURIComponent).join("/")}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Upstash visitor store failed (${response.status})${body ? `: ${body.slice(0, 160)}` : ""}`,
      );
    }

    const payload = (await response.json()) as { result?: unknown };
    return payload.result;
  }

  async function getMetrics(): Promise<VisitorMetrics> {
    const [uniqueRaw, totalRaw] = await Promise.all([
      command(["GET", UNIQUE_KEY]),
      command(["GET", TOTAL_KEY]),
    ]);
    return {
      uniqueVisitors: toCount(uniqueRaw),
      totalVisits: toCount(totalRaw),
    };
  }

  return {
    getMetrics,
    async incrementUnique() {
      const uniqueVisitors = toCount(await command(["INCR", UNIQUE_KEY]));
      const totalVisits = toCount(await command(["GET", TOTAL_KEY]));
      return { uniqueVisitors, totalVisits };
    },
    async incrementTotal() {
      const totalVisits = toCount(await command(["INCR", TOTAL_KEY]));
      const uniqueVisitors = toCount(await command(["GET", UNIQUE_KEY]));
      return { uniqueVisitors, totalVisits };
    },
    async incrementBoth() {
      const [uniqueVisitors, totalVisits] = await Promise.all([
        command(["INCR", UNIQUE_KEY]).then(toCount),
        command(["INCR", TOTAL_KEY]).then(toCount),
      ]);
      return { uniqueVisitors, totalVisits };
    },
  };
}

/**
 * Local JSON file — development only (`next dev`).
 * Never used in production / on Vercel.
 */
function createFileStore(): VisitorStore {
  const filePath = path.join(process.cwd(), ".data", "visitors.json");

  async function read(): Promise<VisitorMetrics> {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as {
        uniqueVisitors?: unknown;
        totalVisits?: unknown;
        /** Legacy single-counter field from earlier builds */
        count?: unknown;
      };
      const legacy = toCount(parsed.count);
      return {
        uniqueVisitors: toCount(parsed.uniqueVisitors ?? legacy),
        totalVisits: toCount(parsed.totalVisits ?? legacy),
      };
    } catch {
      return { uniqueVisitors: 0, totalVisits: 0 };
    }
  }

  async function write(metrics: VisitorMetrics): Promise<VisitorMetrics> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify(
        { ...metrics, updatedAt: new Date().toISOString() },
        null,
        2,
      ),
      "utf8",
    );
    return metrics;
  }

  return {
    async getMetrics() {
      return read();
    },
    async incrementUnique() {
      const current = await read();
      return write({
        ...current,
        uniqueVisitors: current.uniqueVisitors + 1,
      });
    },
    async incrementTotal() {
      const current = await read();
      return write({
        ...current,
        totalVisits: current.totalVisits + 1,
      });
    },
    async incrementBoth() {
      const current = await read();
      return write({
        uniqueVisitors: current.uniqueVisitors + 1,
        totalVisits: current.totalVisits + 1,
      });
    },
  };
}

let cachedStore: VisitorStore | null = null;

/**
 * Resolves the active visitor store.
 * Production → Redis only. Development → file store when Redis is absent.
 */
export function getVisitorStore(): VisitorStore {
  if (cachedStore) return cachedStore;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    cachedStore = createUpstashStore(url, token);
    return cachedStore;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Visitor counter requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }

  cachedStore = createFileStore();
  return cachedStore;
}
