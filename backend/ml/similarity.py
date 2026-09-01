from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def tfidf_cosine_similarity(query: str, docs: list[str]) -> list[float]:
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    corpus = [query] + docs
    X = vectorizer.fit_transform(corpus)
    q = X[0:1]
    d = X[1:]
    sims = cosine_similarity(q, d).flatten()
    return sims.tolist()


def normalize_to_100(scores: list[float]) -> list[float]:
    if not scores:
        return []
    mn = float(np.min(scores))
    mx = float(np.max(scores))
    if mx - mn < 1e-9:
        return [50.0 for _ in scores]
    return [float((s - mn) / (mx - mn) * 100.0) for s in scores]
