/** Request body of POST /predict. Field names must match backend/schemas.py exactly. */
export interface PatientInput {
  age: number;
  sex: 0 | 1;
  cp: 0 | 1 | 2 | 3;
  trestbps: number;
  chol: number;
  thalach: number;
  oldpeak: number;
}

export interface PredictionProbability {
  no_disease: number;
  disease: number;
}

/** Response of POST /predict. */
export interface PredictionResponse {
  prediction: 0 | 1;
  result: string;
  probability: PredictionProbability | null;
}

/** Response of GET /model-info. */
export interface ModelInfo {
  model_name: string;
  features: string[];
  n_features: number;
  target_classes: Record<string, string>;
  prediction_type: string;
  test_metrics: Record<string, number> | null;
  sklearn_version: string | null;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  model_loaded: boolean;
  model_error: string | null;
}
