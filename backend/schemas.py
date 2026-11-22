"""Pydantic request/response models.

Encodings and ranges follow the Cleveland dataset used in the notebook
(``data/heart_cleveland_upload.csv``). Observed dataset ranges are shown in the
field descriptions; the accepted ranges are deliberately wider (physiologically
plausible values, the same limits the notebook's data-cleaning step checks).
"""
from pydantic import BaseModel, ConfigDict, Field


class PatientFeatures(BaseModel):
    model_config = ConfigDict(
        extra="forbid",  # unknown fields are rejected, not silently ignored
        strict=True,     # "54" or true are not accepted as numbers
        json_schema_extra={
            "example": {
                "age": 58, "sex": 1, "cp": 3, "trestbps": 140,
                "chol": 240, "thalach": 120, "oldpeak": 2.0,
            }
        },
    )

    age: int = Field(..., ge=1, le=120, description="Age in years (dataset: 29-77).")
    sex: int = Field(..., ge=0, le=1, description="Biological sex: 0 = female, 1 = male.")
    cp: int = Field(..., ge=0, le=3, description="Chest pain type, 0-3 (categorical code from the dataset).")
    trestbps: int = Field(..., ge=50, le=250, description="Resting blood pressure in mm Hg (dataset: 94-200).")
    chol: int = Field(..., ge=50, le=700, description="Serum cholesterol in mg/dl (dataset: 126-564).")
    thalach: int = Field(..., ge=40, le=250, description="Maximum heart rate achieved in bpm (dataset: 71-202).")
    oldpeak: float = Field(..., ge=0, le=10, description="ST depression induced by exercise (dataset: 0.0-6.2).")


class Probability(BaseModel):
    no_disease: float
    disease: float


class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="0 = no heart disease, 1 = heart disease.")
    result: str
    probability: Probability | None = None


class BatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    records: list[PatientFeatures] = Field(..., min_length=1, description="One or more patient records.")


class BatchPredictionResponse(BaseModel):
    count: int
    predictions: list[PredictionResponse]


class HealthResponse(BaseModel):
    status: str
    app_name: str
    model_loaded: bool
    model_error: str | None = None


class ModelInfoResponse(BaseModel):
    model_name: str
    features: list[str]
    n_features: int
    target_classes: dict[int, str]
    prediction_type: str
    test_metrics: dict[str, float] | None = None
    sklearn_version: str | None = None
