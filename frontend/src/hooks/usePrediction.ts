"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, predict } from "@/lib/api";
import type { PatientInput, PredictionResponse } from "@/types/prediction";

export type PredictionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; input: PatientInput; data: PredictionResponse }
  | { status: "error"; error: ApiError };

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({ status: "idle" });
  const seq = useRef(0);

  const run = useCallback(async (input: PatientInput) => {
    const id = ++seq.current;
    setState({ status: "loading" });
    try {
      const data = await predict(input);
      if (id === seq.current) setState({ status: "success", input, data });
    } catch (e) {
      const error = e instanceof ApiError ? e : new ApiError("server", "Something went wrong while predicting.");
      if (id === seq.current) setState({ status: "error", error });
    }
  }, []);

  const reset = useCallback(() => {
    seq.current++;
    setState({ status: "idle" });
  }, []);

  return { state, run, reset };
}
