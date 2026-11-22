"""Loads the trained scikit-learn pipeline (once, at application start-up)."""
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import joblib

logger = logging.getLogger(__name__)

DEFAULT_CLASS_LABELS = {0: "No heart disease", 1: "Heart disease"}


class ModelLoadError(RuntimeError):
    """Raised when the model or its metadata cannot be loaded or is inconsistent."""


@dataclass
class LoadedModel:
    pipeline: Any
    model_name: str
    features: list[str]
    class_labels: dict[int, str] = field(default_factory=lambda: dict(DEFAULT_CLASS_LABELS))
    test_metrics: dict[str, float] | None = None
    sklearn_version: str | None = None


def load_model(model_path: Path, metadata_path: Path) -> LoadedModel:
    model_path, metadata_path = Path(model_path), Path(metadata_path)
    if not model_path.is_file():
        raise ModelLoadError(
            f"Model file not found at '{model_path}'. Run notebook/Heart_Disease_Prediction.ipynb "
            "to train and export 'heart_disease_model.pkl', or set HDP_MODEL_PATH."
        )
    try:
        pipeline = joblib.load(model_path)
    except Exception as exc:  # corrupt file, incompatible library version, ...
        raise ModelLoadError(f"Could not load model '{model_path}': {exc}") from exc
    if not hasattr(pipeline, "predict"):
        raise ModelLoadError(f"'{model_path}' does not contain a fitted estimator/pipeline.")

    metadata: dict = {}
    if metadata_path.is_file():
        try:
            metadata = json.loads(metadata_path.read_text())
        except json.JSONDecodeError as exc:
            raise ModelLoadError(f"Metadata file '{metadata_path}' is not valid JSON: {exc}") from exc

    # Feature order: the order the pipeline was fitted with is authoritative.
    fitted = getattr(pipeline, "feature_names_in_", None)
    meta_features = metadata.get("features")
    if fitted is not None:
        features = [str(f) for f in fitted]
        if meta_features and list(meta_features) != features:
            raise ModelLoadError(
                f"Metadata features {meta_features} do not match the model's training features {features}."
            )
    elif meta_features:
        features = list(meta_features)
    else:
        raise ModelLoadError("Cannot determine feature names/order: no metadata and model has no feature_names_in_.")

    labels = {int(k): v for k, v in metadata.get("classes", {}).items()} or dict(DEFAULT_CLASS_LABELS)
    logger.info("Model '%s' loaded from %s", metadata.get("model_name", type(pipeline).__name__), model_path)
    return LoadedModel(
        pipeline=pipeline,
        model_name=metadata.get("model_name") or type(pipeline).__name__,
        features=features,
        class_labels=labels,
        test_metrics=metadata.get("test_metrics"),
        sklearn_version=metadata.get("sklearn_version"),
    )
