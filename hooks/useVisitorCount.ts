"use client";

import { useEffect, useState } from "react";
import type { VisitorCountSnapshot } from "@/types/visitors";

type UseVisitorCountResult = {
  count: number | null;
  loading: boolean;
  error: string | null;
};

/**
 * Records a unique visit once, then displays the live total.
 */
export function useVisitorCount(): UseVisitorCountResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/visitors", {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Unable to load visitor count.");
        }

        const payload = (await response.json()) as VisitorCountSnapshot;
        if (cancelled) return;
        setCount(payload.count);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Unable to load visitor count.");
        setCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { count, loading, error };
}
