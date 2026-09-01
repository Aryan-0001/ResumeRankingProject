from __future__ import annotations

import os
from dataclasses import dataclass

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
FIT_MODEL_PATH = os.path.join(ARTIFACT_DIR, "fit_model.joblib")


@dataclass
class FitPrediction:
    probability: float
    explanation: dict


def _make_synthetic_dataset(n: int = 2000, seed: int = 42):
    rng = np.random.default_rng(seed)

    # Features: [similarity, skill_overlap, exp_match, edu_score]
    similarity = rng.uniform(0, 1, size=n)
    overlap = rng.uniform(0, 1, size=n)
    exp = rng.uniform(0, 1, size=n)
    edu = rng.uniform(0, 1, size=n)

    X = np.vstack([similarity, overlap, exp, edu]).T

    # Label: weighted score + noise -> threshold
    score = 0.45 * similarity + 0.35 * overlap + 0.15 * exp + 0.05 * edu
    score += rng.normal(0, 0.06, size=n)
    y = (score > 0.55).astype(int)

    return X, y


def train_and_save_models() -> None:
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    X, y = _make_synthetic_dataset()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    lr = LogisticRegression(max_iter=200)
    rf = RandomForestClassifier(n_estimators=250, random_state=42)

    lr.fit(X_train, y_train)
    rf.fit(X_train, y_train)

    # Choose the model with higher validation accuracy
    lr_acc = float(lr.score(X_test, y_test))
    rf_acc = float(rf.score(X_test, y_test))

    best = {"model": rf if rf_acc >= lr_acc else lr, "metrics": {"lr_acc": lr_acc, "rf_acc": rf_acc}}
    joblib.dump(best, FIT_MODEL_PATH)


def load_or_train():
    if os.path.exists(FIT_MODEL_PATH):
        return joblib.load(FIT_MODEL_PATH)
    train_and_save_models()
    return joblib.load(FIT_MODEL_PATH)


def predict_fit(features: list[float]) -> FitPrediction:
    bundle = load_or_train()
    model = bundle["model"]

    X = np.array(features, dtype=float).reshape(1, -1)
    proba = model.predict_proba(X)[0, 1]

    explanation = {
        "model": model.__class__.__name__,
        "features": {
            "resume_jd_similarity": float(features[0]),
            "skill_overlap": float(features[1]),
            "experience_match": float(features[2]),
            "education_relevance": float(features[3]),
        },
        "trained_metrics": bundle.get("metrics", {}),
    }

    return FitPrediction(probability=float(proba), explanation=explanation)
