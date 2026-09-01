from __future__ import annotations

from functools import lru_cache

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - import fallback for minimal local setups
    SentenceTransformer = None


@lru_cache(maxsize=1)
def get_bert_model() -> SentenceTransformer:
    if SentenceTransformer is None:
        return None
    try:
        return SentenceTransformer("all-MiniLM-L6-v2")
    except Exception:
        return None


def _fallback_embeddings(texts: list[str]) -> np.ndarray:
    vectorizer = TfidfVectorizer(max_features=4096, ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(texts).toarray().astype(np.float32)
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return matrix / norms


def embed_texts(texts: list[str]):
    model = get_bert_model()
    if model is not None:
        try:
            return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        except Exception:
            pass
    return _fallback_embeddings(texts)
