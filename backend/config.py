"""Application configuration (kept separate from application logic).

Every value can be overridden with an environment variable prefixed ``HDP_``,
e.g. ``HDP_MODEL_PATH=/data/model.pkl`` or ``HDP_CORS_ORIGINS='["http://localhost:3000"]'``.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "Heart Disease Prediction API"
    app_version: str = "1.0.0"
    model_path: Path = PROJECT_ROOT / "models" / "heart_disease_model.pkl"
    metadata_path: Path = PROJECT_ROOT / "models" / "heart_disease_model_metadata.json"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    max_batch_size: int = 1000

    model_config = SettingsConfigDict(env_prefix="HDP_")


@lru_cache
def get_settings() -> Settings:
    return Settings()
