"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { History } from "./types";

/** GET /masters/myhistory for the logged-in customer. */
export function useHistory() {
  const [data, setData] = useState<History | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .history()
      .then((h) => {
        if (!cancelled) setData(h);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load your history.");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, error, loading: !data && !error, reload };
}
