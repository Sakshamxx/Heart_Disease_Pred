"""FastAPI application. Run with:  uvicorn backend.main:app --reload"""
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import Settings, get_settings
from .model_loader import LoadedModel, ModelLoadError, load_model
from .prediction import predict
from .schemas import (
    BatchPredictionResponse, BatchRequest, HealthResponse,
    ModelInfoResponse, PatientFeatures, PredictionResponse,
)

logger = logging.getLogger("hdp")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Load once at start-up. A failure doesn't crash the server: the health
        # endpoint reports it and prediction endpoints answer 503.
        app.state.model, app.state.model_error = None, None
        try:
            app.state.model = load_model(settings.model_path, settings.metadata_path)
        except ModelLoadError as exc:
            app.state.model_error = str(exc)
            logger.error("Model failed to load: %s", exc)
        yield

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Predicts the presence of heart disease from seven clinical features using a "
            "scikit-learn pipeline trained in `notebook/Heart_Disease_Prediction.ipynb`. "
            "**Educational project, not a medical device.**"
        ),
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware, allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"], allow_headers=["*"],
    )

    def get_model(request: Request) -> LoadedModel:
        model = request.app.state.model
        if model is None:
            raise HTTPException(status_code=503, detail=f"Model not available: {request.app.state.model_error}")
        return model

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception):
        logger.exception("Unhandled error")
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})

    @app.get("/", response_model=HealthResponse, tags=["Health"], summary="Health check")
    def health(request: Request):
        loaded = request.app.state.model is not None
        return HealthResponse(
            status="ok" if loaded else "degraded",
            app_name=settings.app_name,
            model_loaded=loaded,
            model_error=request.app.state.model_error,
        )

    @app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"], summary="Model information")
    def model_info(model: LoadedModel = Depends(get_model)):
        return ModelInfoResponse(
            model_name=model.model_name,
            features=model.features,
            n_features=len(model.features),
            target_classes=model.class_labels,
            prediction_type="Binary classification",
            test_metrics=model.test_metrics,
            sklearn_version=model.sklearn_version,
        )

    @app.post("/predict", response_model=PredictionResponse, tags=["Prediction"], summary="Predict for one patient")
    def predict_one(patient: PatientFeatures, model: LoadedModel = Depends(get_model)):
        return predict(model, [patient])[0]

    @app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"],
              summary="Predict for multiple patients")
    def predict_batch(batch: BatchRequest, model: LoadedModel = Depends(get_model)):
        if len(batch.records) > settings.max_batch_size:
            raise HTTPException(status_code=413, detail=f"Batch too large (max {settings.max_batch_size} records).")
        preds = predict(model, batch.records)
        return BatchPredictionResponse(count=len(preds), predictions=preds)

    return app


app = create_app()
