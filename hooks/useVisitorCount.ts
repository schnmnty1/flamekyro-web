"use client";

import { useEffect, useState } from "react";
import type { VisitorCountSnapshot } from "@/types/visitors";

type UseVisitorCountResult = {
  count: number | null;
  loading: boolean;
  error: string | null;
};

/** Dedupe Strict Mode double-mount so one page load = one POST */
let visitInflight: Promise<VisitorCountSnapshot> | null = null;

async function postVisit(): Promise<VisitorCountSnapshot> {
  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-FK-Visit": "1",
    },
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load visitor count.");
  }

  return (await response.json()) as VisitorCountSnapshot;
}

/**
 * Records a visit once from the homepage, then displays unique visitors.
 */
export function useVisitorCount(): UseVisitorCountResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!visitInflight) {
      visitInflight = postVisit().finally(() => {
        // Keep resolved promise for remounts in the same page lifetime
      });
    }

    void visitInflight
      .then((payload) => {
        if (cancelled) return;
        setCount(payload.count);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        visitInflight = null;
        setError("Unable to load visitor count.");
        setCount(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { count, loading, error };
}
