import json

import joblib
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.config import PROJECT_ROOT, Settings
from backend.main import create_app

VALID = {"age": 58, "sex": 1, "cp": 3, "trestbps": 140, "chol": 240, "thalach": 120, "oldpeak": 2.0}
MODEL_PATH = PROJECT_ROOT / "models" / "heart_disease_model.pkl"


@pytest.fixture(scope="module")
def client():
    with TestClient(create_app()) as c:  # context manager runs the lifespan (model loading)
        yield c


def test_health(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok" and body["model_loaded"] is True
    assert body["app_name"]


def test_model_info(client):
    r = client.get("/model-info")
    assert r.status_code == 200
    body = r.json()
    assert body["features"] == ["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak"]
    assert body["n_features"] == 7
    assert body["target_classes"] == {"0": "No heart disease", "1": "Heart disease"}
    assert body["prediction_type"] == "Binary classification"
    assert body["model_name"] == "Logistic Regression"


def test_valid_prediction_matches_trained_model(client):
    """The API output must equal what the saved pipeline yields when called directly."""
    r = client.post("/predict", json=VALID)
    assert r.status_code == 200
    body = r.json()
    pipe = joblib.load(MODEL_PATH)
    row = pd.DataFrame([VALID])[list(pipe.feature_names_in_)]
    assert body["prediction"] == int(pipe.predict(row)[0])
    proba = pipe.predict_proba(row)[0]
    assert body["probability"]["disease"] == pytest.approx(proba[1], abs=1e-4)
    assert body["probability"]["no_disease"] == pytest.approx(proba[0], abs=1e-4)
    assert body["probability"]["disease"] + body["probability"]["no_disease"] == pytest.approx(1, abs=1e-3)
    assert body["result"] == ("Heart Disease Detected" if body["prediction"] else "No Heart Disease Detected")


def test_predictions_vary_with_input(client):
    low = {"age": 35, "sex": 0, "cp": 1, "trestbps": 110, "chol": 180, "thalach": 175, "oldpeak": 0.0}
    high = {"age": 66, "sex": 1, "cp": 3, "trestbps": 160, "chol": 280, "thalach": 108, "oldpeak": 3.0}
    p_low = client.post("/predict", json=low).json()["probability"]["disease"]
    p_high = client.post("/predict", json=high).json()["probability"]["disease"]
    assert p_high > p_low


def test_prediction_on_real_dataset_rows(client):
    """Spot check against the real labelled data: accuracy should be well above chance."""
    df = pd.read_csv(PROJECT_ROOT / "data" / "heart_cleveland_upload.csv")
    feats = ["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak"]
    records = [{k: (float(v) if k == "oldpeak" else int(v)) for k, v in row.items()} for row in df[feats].to_dict("records")]
    r = client.post("/predict/batch", json={"records": records})
    assert r.status_code == 200
    preds = [p["prediction"] for p in r.json()["predictions"]]
    acc = (pd.Series(preds) == df["condition"]).mean()
    assert acc > 0.75


@pytest.mark.parametrize("field,value", [
    ("age", 0), ("age", 121), ("sex", 2), ("sex", -1), ("cp", 4), ("cp", -1),
    ("trestbps", 10), ("chol", 5000), ("thalach", 300), ("oldpeak", -1.0), ("oldpeak", 11),
    ("age", "fifty"), ("age", 54.5), ("sex", True), ("chol", None),
])
def test_invalid_values_rejected(client, field, value):
    r = client.post("/predict", json={**VALID, field: value})
    assert r.status_code == 422
    assert any(field in err["loc"] for err in r.json()["detail"])


@pytest.mark.parametrize("missing", list(VALID))
def test_missing_feature_rejected(client, missing):
    payload = {k: v for k, v in VALID.items() if k != missing}
    r = client.post("/predict", json=payload)
    assert r.status_code == 422
    assert any(missing in err["loc"] and err["type"] == "missing" for err in r.json()["detail"])


def test_unknown_field_rejected(client):
    assert client.post("/predict", json={**VALID, "fbs": 1}).status_code == 422


def test_empty_and_malformed_body(client):
    assert client.post("/predict", json={}).status_code == 422
    assert client.post("/predict", content="not json", headers={"content-type": "application/json"}).status_code == 422


def test_batch(client):
    other = {**VALID, "age": 35, "sex": 0, "cp": 1, "oldpeak": 0.0, "thalach": 175}
    r = client.post("/predict/batch", json={"records": [VALID, other]})
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 2 and len(body["predictions"]) == 2
    single = client.post("/predict", json=VALID).json()
    assert body["predictions"][0] == single


def test_batch_validation(client):
    assert client.post("/predict/batch", json={"records": []}).status_code == 422
    r = client.post("/predict/batch", json={"records": [VALID, {**VALID, "cp": 9}]})
    assert r.status_code == 422
    assert "records" in r.json()["detail"][0]["loc"] and 1 in r.json()["detail"][0]["loc"]


def test_batch_size_limit():
    app = create_app(Settings(max_batch_size=1))
    with TestClient(app) as c:
        assert c.post("/predict/batch", json={"records": [VALID, VALID]}).status_code == 413


# ---- model-loading failure handling ----------------------------------------
def test_missing_model_file(tmp_path):
    app = create_app(Settings(model_path=tmp_path / "nope.pkl", metadata_path=tmp_path / "nope.json"))
    with TestClient(app) as c:
        health = c.get("/")
        assert health.status_code == 200
        assert health.json()["status"] == "degraded" and health.json()["model_loaded"] is False
        assert "not found" in health.json()["model_error"]
        for r in (c.get("/model-info"), c.post("/predict", json=VALID),
                  c.post("/predict/batch", json={"records": [VALID]})):
            assert r.status_code == 503 and "Model not available" in r.json()["detail"]


def test_corrupt_model_file(tmp_path):
    bad = tmp_path / "bad.pkl"
    bad.write_text("this is not a pickle")
    app = create_app(Settings(model_path=bad, metadata_path=tmp_path / "x.json"))
    with TestClient(app) as c:
        assert c.get("/").json()["model_loaded"] is False
        assert c.post("/predict", json=VALID).status_code == 503


def test_metadata_feature_mismatch(tmp_path):
    meta = tmp_path / "meta.json"
    meta.write_text(json.dumps({"features": ["age", "sex"]}))
    app = create_app(Settings(model_path=MODEL_PATH, metadata_path=meta))
    with TestClient(app) as c:
        assert c.get("/").json()["model_loaded"] is False
        assert "do not match" in c.get("/").json()["model_error"]


def test_cors_headers(client):
    r = client.options("/predict", headers={"Origin": "http://localhost:3000",
                                            "Access-Control-Request-Method": "POST"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"
