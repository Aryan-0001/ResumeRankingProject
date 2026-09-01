from __future__ import annotations

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from auth.dependencies import require_roles
from database.session import get_db
from models.application import Application, ApplicationStatus
from models.candidate import Candidate
from models.company import Company
from models.job import Job
from models.user import User
from ml.gemini_service import gemini_service
from ml.advanced_ai_service import advanced_ai_service
from ml.scoring_service import compute_application_scores
from ml.resume_extractor import extract_resume_text
from utils.schemas import (
    ApplicationOut,
    CompanyProfileOut,
    CompanyProfileUpdate,
    JobFitOut,
    JobCreate,
    JobOut,
    JobUpdate,
    RankResumesOut,
    RankedApplicationOut,
    SetApplicationStatus,
)

router = APIRouter()


def _load_resume_text(resume_path: str) -> str:
    return extract_resume_text(resume_path)


@router.get("/me", response_model=CompanyProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> CompanyProfileOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")
    return CompanyProfileOut.model_validate(company, from_attributes=True)


@router.put("/me", response_model=CompanyProfileOut)
def update_my_profile(
    payload: CompanyProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> CompanyProfileOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(company, k, v)

    db.commit()
    db.refresh(company)
    return CompanyProfileOut.model_validate(company, from_attributes=True)


@router.post("/post-job", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def post_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> JobOut:
    print(f"Received job payload: {payload}")
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    job = Job(
        company_id=company.id,
        job_title=payload.job_title,
        job_description=payload.job_description,
        required_skills=payload.required_skills,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Load company relationship and create proper output
    job_with_company = db.scalar(select(Job).options(joinedload(Job.company)).where(Job.id == job.id))
    job_dict = {
        "id": job_with_company.id,
        "company_id": job_with_company.company_id,
        "job_title": job_with_company.job_title,
        "job_description": job_with_company.job_description,
        "required_skills": job_with_company.required_skills,
        "location": job_with_company.location,
        "salary": job_with_company.salary,
        "company": job_with_company.company.company_name if job_with_company.company else "Unknown Company"
    }
    return JobOut(**job_dict)


@router.get("/jobs", response_model=list[JobOut])
def my_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> list[JobOut]:
    """Get all jobs for the company with AI insights"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    jobs = db.scalars(select(Job).options(joinedload(Job.company)).where(Job.company_id == company.id).order_by(Job.id.desc())).all()
    
    # Create job output with company names
    job_outputs = []
    for job in jobs:
        job_dict = {
            "id": job.id,
            "company_id": job.company_id,
            "job_title": job.job_title,
            "job_description": job.job_description,
            "required_skills": job.required_skills,
            "location": job.location,
            "salary": job.salary,
            "company": job.company.company_name if job.company else "Unknown Company"
        }
        job_outputs.append(JobOut(**job_dict))
    
    return job_outputs


@router.put("/jobs/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    payload: JobUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> JobOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    job = db.get(Job, job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(job, k, v)

    db.commit()
    db.refresh(job)
    
    # Load company relationship and create proper output
    job_with_company = db.scalar(select(Job).options(joinedload(Job.company)).where(Job.id == job.id))
    job_dict = {
        "id": job_with_company.id,
        "company_id": job_with_company.company_id,
        "job_title": job_with_company.job_title,
        "job_description": job_with_company.job_description,
        "required_skills": job_with_company.required_skills,
        "location": job_with_company.location,
        "salary": job_with_company.salary,
        "company": job_with_company.company.company_name if job_with_company.company else "Unknown Company"
    }
    return JobOut(**job_dict)


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    job = db.get(Job, job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Check if there are applications for this job
    applications = db.scalars(select(Application).where(Application.job_id == job_id)).all()
    if applications:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete job with existing applications")

    db.delete(job)
    db.commit()


@router.get("/applications", response_model=list[ApplicationOut])
async def list_applications(
    job_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> list[ApplicationOut]:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    stmt = (
        select(Application)
        .join(Job, Job.id == Application.job_id)
        .join(Candidate, Candidate.id == Application.candidate_id)
        .where(Job.company_id == company.id)
    )
    if job_id is not None:
        stmt = stmt.where(Application.job_id == job_id)

    apps = db.scalars(stmt.order_by(Application.id.desc())).all()
    
    enhanced_apps = []
    for app in apps:
        try:
            # Get AI insights for each candidate
            ai_analysis = await gemini_service.predict_job_success(
                f"Candidate Profile: {app.candidate.name}\nSkills: {app.candidate.skills or 'Not specified'}\nEducation: {app.candidate.education or 'Not specified'}\nExperience: {app.candidate.experience or 'Not specified'}",
                f"Job Requirements: {app.job.job_title}\nDescription: {app.job.job_description}\nRequired Skills: {', '.join(app.job.required_skills)}"
            )
            
            # Create enhanced application with AI insights
            app_dict = {
                "id": app.id,
                "candidate_id": app.candidate_id,
                "job_id": app.job_id,
                "resume_score": app.resume_score,
                "fit_percentage": app.fit_percentage,
                "status": app.status,
                "ai_insights": ai_analysis,
                "candidate_name": app.candidate.name,
                "candidate_skills": app.candidate.skills,
                "job_title": app.job.job_title
            }
            enhanced_apps.append(ApplicationOut(**app_dict))
            
        except Exception as e:
            # Fallback to basic application data if AI fails
            app_dict = {
                "id": app.id,
                "candidate_id": app.candidate_id,
                "job_id": app.job_id,
                "resume_score": app.resume_score,
                "fit_percentage": app.fit_percentage,
                "status": app.status,
                "candidate_name": app.candidate.name,
                "job_title": app.job.job_title
            }
            enhanced_apps.append(ApplicationOut(**app_dict))
    
    return enhanced_apps


@router.patch("/applications/{application_id}/status", response_model=ApplicationOut)
def set_application_status(
    application_id: int,
    payload: SetApplicationStatus,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> ApplicationOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    app.status = ApplicationStatus(payload.status.value)
    db.commit()
    db.refresh(app)
    return ApplicationOut.model_validate(app, from_attributes=True)


@router.get("/rank-resumes", response_model=RankResumesOut)
def rank_resumes(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> RankResumesOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    job = db.get(Job, job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    apps = db.scalars(select(Application).where(Application.job_id == job.id)).all()

    ranked: list[RankedApplicationOut] = []
    for app in apps:
        candidate = db.get(Candidate, app.candidate_id)
        if not candidate or not candidate.resume_path:
            matched = []
            miss = [s.lower().strip() for s in job.required_skills]
            resume_score = float(app.resume_score or 0.0)
            fit_pct = float(app.fit_percentage or 0.0)
        else:
            scores = compute_application_scores(
                job_description=job.job_description,
                required_skills=job.required_skills,
                resume_path=candidate.resume_path,
            )
            resume_score = float(scores["resume_score"])
            fit_pct = float(scores["fit_percentage"])
            matched = scores["matched_skills"]
            miss = scores["missing_skills"]

            app.resume_score = resume_score
            app.fit_percentage = fit_pct
            db.add(app)

        ranked.append(
            RankedApplicationOut(
                application_id=app.id,
                candidate_id=app.candidate_id,
                job_id=app.job_id,
                resume_score=resume_score,
                fit_percentage=fit_pct,
                status=app.status.value,
                matched_skills=matched,
                missing_skills=miss,
            )
        )

    db.commit()
    ranked.sort(key=lambda x: x.resume_score, reverse=True)
    return RankResumesOut(job_id=job.id, ranked=ranked)


@router.get("/predict-fit", response_model=JobFitOut)
def predict_fit_endpoint(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
) -> JobFitOut:
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Candidate resume not uploaded")

    scores = compute_application_scores(
        job_description=job.job_description,
        required_skills=job.required_skills,
        resume_path=candidate.resume_path,
    )

    app.resume_score = float(scores["resume_score"])
    app.fit_percentage = float(scores["fit_percentage"])
    db.commit()
    db.refresh(app)

    suggestions = [f"Consider adding missing skill: {s}" for s in scores["missing_skills"]]
    if not suggestions:
        suggestions = ["Your resume covers the required skills well. Consider adding measurable achievements."]

    return JobFitOut(
        application_id=app.id,
        job_id=job.id,
        resume_score=float(app.resume_score or 0.0),
        fit_percentage=float(app.fit_percentage or 0.0),
        matched_skills=scores["matched_skills"],
        missing_skills=scores["missing_skills"],
        suggestions=suggestions,
        explanation=scores["explanation"],
    )


@router.get("/ai-analysis/{application_id}")
async def get_ai_analysis(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Advanced AI analysis of candidate using SambaNova"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Candidate resume not uploaded")

    # Read resume text
    try:
        resume_text = _load_resume_text(candidate.resume_path)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Get AI analysis
    analysis = await gemini_service.analyze_resume(resume_text, job.job_description)
    
    return {
        "application_id": app.id,
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "ai_analysis": analysis
    }


@router.get("/interview-questions/{application_id}")
async def get_interview_questions(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Generate personalized interview questions using AI"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Candidate resume not uploaded")

    # Read resume text
    try:
        resume_text = _load_resume_text(candidate.resume_path)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Generate interview questions
    questions = await gemini_service.generate_interview_questions(resume_text, job.job_description)
    
    return {
        "application_id": app.id,
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "interview_questions": questions
    }


@router.get("/predict-success/{application_id}")
async def predict_candidate_success(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Predict candidate success probability using AI"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Candidate resume not uploaded")

    # Read resume text
    try:
        resume_text = _load_resume_text(candidate.resume_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Create candidate profile
    candidate_profile = f"""
    Name: {candidate.name or 'Unknown'}
    Skills: {candidate.skills or 'Not specified'}
    Resume Score: {app.resume_score}
    Fit Percentage: {app.fit_percentage}
    Resume: {resume_text}
    """

    # Create job requirements
    job_requirements = f"""
    Job Title: {job.job_title}
    Job Description: {job.job_description}
    Required Skills: {', '.join(job.required_skills)}
    """

    # Predict success
    prediction = await gemini_service.predict_job_success(candidate_profile, job_requirements)
    
    return {
        "application_id": app.id,
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "success_prediction": prediction
    }


@router.get("/advanced-analysis/{application_id}")
async def get_comprehensive_analysis(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Ultra-comprehensive candidate analysis"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Candidate resume not uploaded")

    # Read resume text
    try:
        resume_text = _load_resume_text(candidate.resume_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Get comprehensive analysis
    analysis = await advanced_ai_service.comprehensive_candidate_analysis(
        resume_text, job.job_description, company.description or ""
    )
    
    return {
        "application_id": app.id,
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "comprehensive_analysis": analysis
    }


@router.get("/market-intelligence/{job_id}")
async def get_market_intelligence(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Market intelligence for job positioning"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    job = db.get(Job, job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Get market intelligence
    intelligence = await advanced_ai_service.market_intelligence_analysis(
      job.job_description, 
      "",  # No location field in Company model
      ""  # No industry field in Company model
    )
    
    return {
      "job_id": job.id,
      "job_title": job.job_title,
      "company_name": company.company_name or "Company",
      "market_intelligence": intelligence
    }


@router.get("/team-compatibility/{application_id}")
async def analyze_team_compatibility(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Advanced team compatibility analysis"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    candidate = db.get(Candidate, app.candidate_id)
    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate not found")

    # Get existing team members (simplified - in real app, would have proper team data)
    team_members = [
        {"name": "Team Member 1", "role": "Senior Developer", "skills": ["Python", "JavaScript"], "working_style": "collaborative"},
        {"name": "Team Member 2", "role": "Product Manager", "skills": ["Strategy", "Communication"], "working_style": "analytical"}
    ]

    new_candidate = {
        "name": candidate.name,
        "role": job.job_title,
        "skills": candidate.skills.split(',') if candidate.skills else [],
        "working_style": "collaborative"  # Would be determined from resume analysis
    }

    # Get team compatibility analysis
    compatibility = await advanced_ai_service.team_compatibility_analyzer(team_members, new_candidate)
    
    return {
        "application_id": app.id,
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "team_compatibility": compatibility
    }


@router.get("/workforce-planning")
async def get_workforce_planning(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["company"])),
):
    """Strategic workforce planning and predictions"""
    company = db.scalar(select(Company).where(Company.user_id == user.id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    # Get company data
    jobs = db.scalars(select(Job).where(Job.company_id == company.id)).all()
    applications = db.scalars(select(Application).join(Job).where(Job.company_id == company.id)).all()

    company_data = {
        "name": company.company_name or "Company",
        "industry": "Technology",  # Default industry
        "size": len(jobs),
        "active_applications": len(applications),
        "hiring_velocity": len(jobs)  # Simplified - just total job count
    }

    industry_trends = {
        "growth_rate": 0.15,
        "emerging_technologies": ["AI", "Machine Learning", "Cloud Computing"],
        "skill_demand_shifts": {"Python": "increasing", "TraditionalSkills": "decreasing"}
    }

    market_data = {
        "talent_supply": "moderate",
        "competition_level": "high",
        "average_time_to_fill": 45
    }

    # Get workforce planning insights
    planning = await advanced_ai_service.predictive_workforce_planning(company_data, industry_trends, market_data)
    
    return {
        "company_name": company.company_name or "Company",
        "workforce_planning": planning
    }
