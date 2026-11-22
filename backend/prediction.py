"""Runs predictions with the loaded pipeline."""
import pandas as pd

from .model_loader import LoadedModel
from .schemas import PatientFeatures, PredictionResponse, Probability

RESULT_TEXT = {0: "No Heart Disease Detected", 1: "Heart Disease Detected"}


def predict(model: LoadedModel, records: list[PatientFeatures]) -> list[PredictionResponse]:
    # Columns are ordered exactly as during training; the saved pipeline applies
    # the same scaling / encoding that was fitted on the training data.
    frame = pd.DataFrame([r.model_dump() for r in records])[model.features]
    preds = model.pipeline.predict(frame)

    probas = None
    if hasattr(model.pipeline, "predict_proba"):
        classes = list(model.pipeline.classes_)
        probas = model.pipeline.predict_proba(frame)
        idx = {c: classes.index(c) for c in (0, 1)}

    out = []
    for i, p in enumerate(preds):
        p = int(p)
        prob = None
        if probas is not None:
            prob = Probability(
                no_disease=round(float(probas[i][idx[0]]), 4),
                disease=round(float(probas[i][idx[1]]), 4),
            )
        out.append(PredictionResponse(prediction=p, result=RESULT_TEXT[p], probability=prob))
    return out
