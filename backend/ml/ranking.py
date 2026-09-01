from __future__ import annotations

import numpy as np

from ml.bert_embedder import embed_texts
from ml.similarity import normalize_to_100, tfidf_cosine_similarity


def rank_resumes(job_description: str, resume_texts: list[str]) -> dict:
    if not resume_texts:
        return {"tfidf": [], "bert": [], "combined": []}

    tfidf_raw = tfidf_cosine_similarity(job_description, resume_texts)
    tfidf_norm = normalize_to_100(tfidf_raw)

    emb = embed_texts([job_description] + resume_texts)
    q = emb[0:1]
    d = emb[1:]
    bert_raw = (q @ d.T).flatten().tolist()
    bert_norm = normalize_to_100(bert_raw)

    combined = (0.5 * np.array(tfidf_norm) + 0.5 * np.array(bert_norm)).tolist()

    return {
        "tfidf": tfidf_norm,
        "bert": bert_norm,
        "combined": combined,
    }
