import type { HealthStatus, ModelInfo, PatientInput, PredictionResponse } from "@/types/prediction";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export type ApiErrorKind = "network" | "validation" | "unavailable" | "server";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public fieldErrors: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FastApiValidationItem {
  loc: (string | number)[];
  msg: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "network",
      `Could not reach the prediction service at ${API_URL}. Make sure the FastAPI backend is running.`,
    );
  }

  if (res.ok) {
    try {
      return (await res.json()) as T;
    } catch {
      throw new ApiError("server", "The prediction service returned an unreadable response.");
    }
  }

  let detail: unknown;
  try {
    detail = (await res.json())?.detail;
  } catch {
    /* non-JSON error body (e.g. another app answering on this port) */
  }

  if (res.status === 422 && Array.isArray(detail)) {
    const items = detail as FastApiValidationItem[];
    throw new ApiError(
      "validation",
      "The service rejected the submitted values.",
      items.map((d) => `${d.loc.filter((p) => p !== "body").join(".") || "input"}: ${d.msg}`),
    );
  }
  if (res.status === 503) {
    throw new ApiError("unavailable", typeof detail === "string" ? detail : "The model is not available right now.");
  }
  throw new ApiError("server", typeof detail === "string" ? detail : `The service responded with status ${res.status}.`);
}

export const getHealth = () => request<HealthStatus>("/");
export const getModelInfo = () => request<ModelInfo>("/model-info");
export const predict = (input: PatientInput) =>
  request<PredictionResponse>("/predict", { method: "POST", body: JSON.stringify(input) });
