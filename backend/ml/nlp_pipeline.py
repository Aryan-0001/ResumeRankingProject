from __future__ import annotations

import re
from functools import lru_cache

import spacy

from config import settings
from ml.skills_catalog import SKILLS


@lru_cache(maxsize=1)
def get_nlp():
    try:
        return spacy.load(settings.spacy_model)
    except Exception:
        # Fall back to a lightweight English pipeline when the model is not installed.
        return spacy.blank("en")


def normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_and_lemmatize(text: str) -> str:
    nlp = get_nlp()
    doc = nlp(normalize_text(text))

    tokens: list[str] = []
    for token in doc:
        if token.is_space or token.is_punct or token.is_stop:
            continue
        if token.like_email or token.like_url:
            continue
        lemma = token.lemma_.lower().strip() if token.lemma_ else token.text.lower().strip()
        if not lemma or len(lemma) < 2:
            continue
        tokens.append(lemma)

    return " ".join(tokens)


def extract_skills(raw_text: str) -> list[str]:
    t = normalize_text(raw_text).lower()

    found: set[str] = set()
    for s in SKILLS:
        key = s.lower()
        if key in t:
            found.add(s)

    return sorted(found)


def missing_skills(required: list[str], candidate: list[str]) -> list[str]:
    req = {r.lower().strip() for r in required if r and r.strip()}
    cand = {c.lower().strip() for c in candidate if c and c.strip()}

    missing = sorted([r for r in req if r not in cand])
    return missing
