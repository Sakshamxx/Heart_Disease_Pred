"use client";

import { useEffect, useState } from "react";
import { getModelInfo } from "@/lib/api";
import type { ModelInfo } from "@/types/prediction";

/** Fetches live model details from the API. `info` stays null if the backend is unreachable. */
export function useModelInfo() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getModelInfo()
      .then((d) => !cancelled && setInfo(d))
      .catch(() => !cancelled && setInfo(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { info, loading };
}
