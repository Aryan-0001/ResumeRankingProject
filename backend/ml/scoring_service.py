from __future__ import annotations

from dataclasses import asdict

from ml.features import education_score, experience_years_estimate, skill_overlap
from ml.fit_model import predict_fit
from ml.nlp_pipeline import clean_and_lemmatize, extract_skills, missing_skills
from ml.ranking import rank_resumes
from ml.resume_extractor import extract_resume_text


def compute_application_scores(
    *,
    job_description: str,
    required_skills: list[str],
    resume_path: str,
) -> dict:
    resume_text_raw = extract_resume_text(resume_path)

    jd_clean = clean_and_lemmatize(job_description)
    resume_clean = clean_and_lemmatize(resume_text_raw)

    ranking = rank_resumes(jd_clean, [resume_clean])
    resume_score = float(ranking["combined"][0])

    found_skills = extract_skills(resume_text_raw)
    miss = missing_skills(required_skills, found_skills)

    req_set = {s.lower().strip() for s in required_skills if s and s.strip()}
    found_set = {s.lower().strip() for s in found_skills if s and s.strip()}
    matched = sorted([s for s in req_set if s in found_set])

    overlap = skill_overlap(required_skills, found_skills)

    resume_years = experience_years_estimate(resume_text_raw)
    req_years = experience_years_estimate(job_description)
    exp_match = 1.0 if req_years <= 0 else float(min(1.0, resume_years / req_years))

    edu = education_score(resume_text_raw)

    similarity_feature = float(resume_score / 100.0)
    pred = predict_fit([similarity_feature, overlap, exp_match, edu])

    return {
        "resume_score": resume_score,
        "fit_percentage": float(pred.probability * 100.0),
        "matched_skills": matched,
        "missing_skills": miss,
        "explanation": asdict(pred),
        "debug": {
            "resume_years": resume_years,
            "required_years": req_years,
            "overlap": overlap,
            "education_score": edu,
            "similarity": similarity_feature,
        },
    }
