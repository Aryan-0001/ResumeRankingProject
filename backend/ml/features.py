from __future__ import annotations

import re


def experience_years_estimate(text: str) -> float:
    t = text.lower()

    patterns = [
        r"(\d+(?:\.\d+)?)\s*\+?\s*years",
        r"(\d+(?:\.\d+)?)\s*\+?\s*yrs",
    ]

    years: list[float] = []
    for p in patterns:
        for m in re.findall(p, t):
            try:
                years.append(float(m))
            except ValueError:
                continue

    if not years:
        return 0.0

    return float(max(years))


def education_score(text: str) -> float:
    t = text.lower()
    if any(k in t for k in ["phd", "doctorate"]):
        return 1.0
    if any(k in t for k in ["m.tech", "mtech", "m.s", "ms", "master", "mba", "m.sc", "msc"]):
        return 0.8
    if any(k in t for k in ["b.tech", "btech", "b.e", "be", "b.sc", "bsc", "bachelor"]):
        return 0.6
    if any(k in t for k in ["diploma"]):
        return 0.4
    return 0.2


def skill_overlap(required: list[str], found: list[str]) -> float:
    req = {r.lower().strip() for r in required if r and r.strip()}
    cand = {c.lower().strip() for c in found if c and c.strip()}
    if not req:
        return 0.0
    return float(len(req & cand) / len(req))
