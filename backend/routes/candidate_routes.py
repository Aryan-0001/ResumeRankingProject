from __future__ import annotations

import httpx
import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from auth.dependencies import require_roles
from config import settings
from database.session import get_db
from ml.gemini_service import gemini_service
from ml.advanced_ai_service import advanced_ai_service
from ml.scoring_service import compute_application_scores
from ml.resume_extractor import extract_resume_text
from ml.resume_parser import parse_resume
from models.application import Application
from models.candidate import Candidate
from models.job import Job
from models.user import User
from utils.schemas import (
    ApplicationOut,
    CandidateProfileOut,
    CandidateProfileUpdate,
    JobFitOut,
    JobOut,
)

router = APIRouter()


@router.get("/me", response_model=CandidateProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> CandidateProfileOut:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")
    return CandidateProfileOut.model_validate(candidate, from_attributes=True)


@router.put("/me", response_model=CandidateProfileOut)
def update_my_profile(
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> CandidateProfileOut:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(candidate, k, v)

    db.commit()
    db.refresh(candidate)
    return CandidateProfileOut.model_validate(candidate, from_attributes=True)


@router.post("/upload-resume", response_model=CandidateProfileOut)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> CandidateProfileOut:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    filename = file.filename or "resume"
    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX supported")

    settings.upload_dir_path.mkdir(parents=True, exist_ok=True)
    safe_name = f"candidate_{candidate.id}_resume{ext}"
    dest_path = settings.upload_dir_path / safe_name

    with open(dest_path, "wb") as f:
        f.write(file.file.read())

    # Parse resume and extract information
    try:
        resume_text = extract_resume_text(dest_path)
        parsed_data = parse_resume(resume_text)
        
        # Update candidate profile with parsed data
        if parsed_data['contact'].get('name'):
            candidate.name = parsed_data['contact']['name']
        
        # Extract skills and save as comma-separated string
        skills_list = parsed_data['skills']
        if skills_list:
            candidate.skills = ', '.join(skills_list)
        
        # Save education, experience, and projects as structured text
        if parsed_data['education']:
            candidate.education = '\n\n'.join(parsed_data['education'])
        
        if parsed_data['experience']:
            candidate.experience = '\n\n'.join(parsed_data['experience'])
            
    except Exception as e:
        # If parsing fails, still save the resume file
        print(f"Resume parsing failed: {e}")

    candidate.resume_path = str(dest_path)
    db.commit()
    db.refresh(candidate)

    return CandidateProfileOut.model_validate(candidate, from_attributes=True)


@router.get("/recommended-jobs", response_model=list[JobOut])
async def get_recommended_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> list[JobOut]:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    # Get all jobs with company relationships
    all_jobs = db.scalars(select(Job).options(joinedload(Job.company))).all()
    
    # Enhanced AI-powered job recommendations
    if candidate.skills:
        candidate_skills = [skill.strip().lower() for skill in candidate.skills.split(',')]
        job_scores = []
        
        for job in all_jobs:
            job_skills = [skill.lower() for skill in job.required_skills]
            
            # Calculate basic skill overlap percentage
            matching_skills = set(candidate_skills) & set(job_skills)
            basic_match_percentage = len(matching_skills) / len(job_skills) * 100 if job_skills else 0
            
            # Use Gemini AI for enhanced analysis
            try:
                ai_analysis = await gemini_service.predict_job_success(
                    f"Candidate Profile: {candidate.name}\nSkills: {candidate.skills}\nEducation: {candidate.education}\nExperience: {candidate.experience}",
                    f"Job Requirements: {job.job_title}\nDescription: {job.job_description}\nRequired Skills: {', '.join(job.required_skills)}"
                )
                
                # Combine basic matching with AI analysis
                ai_score = ai_analysis.get('success_probability', 75)
                enhanced_score = (basic_match_percentage * 0.4) + (ai_score * 0.6)
                
                job_scores.append((job, enhanced_score, ai_analysis))
                
            except Exception as e:
                # Fallback to basic scoring if AI fails
                job_scores.append((job, basic_match_percentage, None))
        
        # Sort by enhanced score (highest first)
        job_scores.sort(key=lambda x: x[1], reverse=True)
        recommended_jobs = [(job, score, ai_analysis) for job, score, ai_analysis in job_scores if score > 30]  # Only jobs with decent match
    else:
        # If no skills, return all jobs with basic AI analysis
        recommended_jobs = []
        for job in all_jobs[:10]:
            try:
                ai_analysis = await gemini_service.predict_job_success(
                    f"Candidate Profile: {candidate.name}\nEducation: {candidate.education}\nExperience: {candidate.experience}",
                    f"Job Requirements: {job.job_title}\nDescription: {job.job_description}\nRequired Skills: {', '.join(job.required_skills)}"
                )
                recommended_jobs.append((job, 50, ai_analysis))  # Default score for no skills
            except:
                recommended_jobs.append((job, 30, None))
    
    # Create job output with company names and AI insights
    job_outputs = []
    for job, score, ai_analysis in recommended_jobs[:10]:  # Return top 10
        job_dict = {
            "id": job.id,
            "company_id": job.company_id,
            "job_title": job.job_title,
            "job_description": job.job_description,
            "required_skills": job.required_skills,
            "location": job.location,
            "salary": job.salary,
            "company": job.company.company_name if job.company else "Unknown Company",
            "ai_match_score": round(score, 1),
            "ai_insights": ai_analysis
        }
        job_outputs.append(JobOut(**job_dict))
    
    return job_outputs


@router.get("/jobs", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db), user: User = Depends(require_roles(["candidate"]))):
    jobs = db.scalars(select(Job).options(joinedload(Job.company)).order_by(Job.id.desc())).all()
    
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


@router.post("/apply/{job_id}", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> ApplicationOut:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = db.scalar(
        select(Application).where(Application.candidate_id == candidate.id, Application.job_id == job.id)
    )
    if existing:
        return ApplicationOut.model_validate(existing, from_attributes=True)

    app = Application(candidate_id=candidate.id, job_id=job.id)
    if candidate.resume_path:
        scores = compute_application_scores(
            job_description=job.job_description,
            required_skills=job.required_skills,
            resume_path=candidate.resume_path,
        )
        app.resume_score = float(scores["resume_score"])
        app.fit_percentage = float(scores["fit_percentage"])
    db.add(app)
    db.commit()
    db.refresh(app)
    return ApplicationOut.model_validate(app, from_attributes=True)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    application = db.scalar(
        select(Application).where(
            Application.id == application_id,
            Application.candidate_id == candidate.id
        )
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    # Only allow withdrawal if not already shortlisted or rejected
    if application.status in ["shortlisted", "rejected"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot withdraw application that has been processed")
    
    db.delete(application)
    db.commit()


@router.get("/job-fit", response_model=JobFitOut)
def get_job_fit(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> JobFitOut:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    app = db.get(Application, application_id)
    if not app or app.candidate_id != candidate.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, app.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Resume not uploaded")

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


@router.get("/applications", response_model=list[ApplicationOut])
def my_applications(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
) -> list[ApplicationOut]:
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    apps = db.scalars(select(Application).where(Application.candidate_id == candidate.id).order_by(Application.id.desc())).all()
    return [ApplicationOut.model_validate(a, from_attributes=True) for a in apps]


@router.get("/optimize-resume/{job_id}")
async def optimize_resume_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """AI-powered resume optimization for specific job"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    if not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Please upload a resume first")

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Read resume text
    try:
        resume_text = extract_resume_text(candidate.resume_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Create target job description
    target_job = f"""
    Job Title: {job.job_title}
    Job Description: {job.job_description}
    Required Skills: {', '.join(job.required_skills)}
    """

    # Get AI optimization suggestions using Gemini
    try:
        optimization = await gemini_service.analyze_resume(resume_text, target_job)
        
        # Extract actionable suggestions from AI analysis
        suggestions = []
        if optimization.get('weaknesses'):
            suggestions.extend([f"Address: {weakness}" for weakness in optimization['weaknesses'][:3]])
        if optimization.get('recommendations'):
            suggestions.extend([f"Consider: {rec}" for rec in optimization['recommendations'][:3]])
        
        if not suggestions:
            suggestions = ["Your resume is well-matched. Consider adding quantifiable achievements and metrics."]
            
    except Exception as e:
        # Fallback suggestions if AI fails
        suggestions = [
            "Add quantifiable achievements and metrics to your experience",
            "Ensure your skills section highlights the required skills for this job",
            "Tailor your resume summary to match the job description"
        ]
        optimization = {
            "overall_score": 75,
            "skills_match": 70,
            "experience_match": 80,
            "strengths": ["Good experience", "Relevant skills"],
            "weaknesses": ["Missing some requirements"],
            "recommendations": ["Consider highlighting specific achievements"],
            "fit_percentage": 75
        }
    
    return {
        "job_id": job.id,
        "job_title": job.job_title,
        "candidate_name": candidate.name,
        "optimization_suggestions": optimization,
        "actionable_suggestions": suggestions
    }


@router.get("/career-analysis")
async def get_career_analysis(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """AI-powered career analysis and guidance"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    # Get candidate's applications
    apps = db.scalars(select(Application).where(Application.candidate_id == candidate.id)).all()
    
    # Create career profile
    career_profile = f"""
    Name: {candidate.name}
    Skills: {candidate.skills or 'Not specified'}
    Education: {candidate.education or 'Not specified'}
    Experience: {candidate.experience or 'Not specified'}
    Number of Applications: {len(apps)}
    Average Resume Score: {sum(a.resume_score or 0 for a in apps) / len(apps) if apps else 0}
    Average Fit Percentage: {sum(a.fit_percentage or 0 for a in apps) / len(apps) if apps else 0}
    """

    # Use Gemini to analyze career profile and provide guidance
    analysis = await gemini_service.predict_job_success(career_profile, "General career development and growth opportunities")
    
    return {
        "candidate_name": candidate.name,
        "career_analysis": analysis,
        "application_stats": {
            "total_applications": len(apps),
            "avg_resume_score": sum(a.resume_score or 0 for a in apps) / len(apps) if apps else 0,
            "avg_fit_percentage": sum(a.fit_percentage or 0 for a in apps) / len(apps) if apps else 0,
        }
    }


@router.get("/interview-prep/{application_id}")
async def get_interview_preparation(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """AI-powered interview preparation"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    app = db.get(Application, application_id)
    if not app or app.candidate_id != candidate.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if not candidate.resume_path:
        raise HTTPException(status_code=400, detail="Please upload a resume first")

    job = db.get(Job, app.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Read resume text
    try:
        resume_text = extract_resume_text(candidate.resume_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read resume: {str(e)}")

    # Generate interview questions using Gemini
    try:
        questions = await gemini_service.generate_interview_questions(resume_text, job.job_description)
        
        # Add personalized tips based on AI analysis
        preparation_tips = [
            "Research the company and understand their values",
            "Prepare examples of your past achievements using the STAR method",
            "Practice answering common behavioral questions",
            "Prepare thoughtful questions to ask the interviewer",
            "Review the job description and align your answers",
            f"Focus on demonstrating: {', '.join(job.required_skills[:3])}",
            "Be ready to discuss your resume experience in detail"
        ]
        
    except Exception as e:
        # Fallback questions if AI fails
        questions = {
            "technical_questions": [
                "What experience do you have with our tech stack?",
                "Describe a challenging technical problem you've solved",
                "How do you stay updated with new technologies?"
            ],
            "behavioral_questions": [
                "Tell me about a time you faced a challenge",
                "Describe a situation where you had to work with a difficult team member",
                "How do you handle tight deadlines?"
            ],
            "experience_questions": [
                "Walk me through your most relevant project",
                "Why are you interested in this role?",
                "Where do you see yourself in 5 years?"
            ],
            "general_questions": [
                "What are your strengths and weaknesses?",
                "Why do you want to work with our company?",
                "What questions do you have for us?"
            ]
        }
        
        preparation_tips = [
            "Research the company and understand their values",
            "Prepare examples of your past achievements",
            "Practice answering common behavioral questions",
            "Prepare questions to ask the interviewer",
            "Review the job description and align your answers"
        ]
    
    return {
        "application_id": app.id,
        "job_title": job.job_title,
        "company_name": job.company.company_name if job.company else "Company",
        "interview_questions": questions,
        "preparation_tips": preparation_tips
    }


@router.get("/career-path-planner/{target_role}")
async def get_career_path_planner(
    target_role: str,
    timeline_months: int = 24,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """Advanced career path planning with AI orchestration"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    # Get candidate's current role from experience or applications
    current_role = "Professional"  # Default, would be extracted from resume in real implementation
    
    # Create comprehensive candidate profile
    candidate_profile = f"""
    Name: {candidate.name or 'Unknown'}
    Skills: {candidate.skills or 'Not specified'}
    Education: {candidate.education or 'Not specified'}
    Experience: {candidate.experience or 'Not specified'}
    """

    # Get career path plan
    career_plan = await advanced_ai_service.career_path_orchestrator(
        candidate_profile, current_role, target_role, timeline_months
    )
    
    return {
        "candidate_name": candidate.name,
        "current_role": current_role,
        "target_role": target_role,
        "timeline_months": timeline_months,
        "career_path_plan": career_plan
    }


@router.get("/skill-gap-analysis/{job_id}")
async def get_comprehensive_skill_gap_analysis(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """Comprehensive skill gap analysis with learning recommendations"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Create detailed analysis
    candidate_skills = candidate.skills.split(',') if candidate.skills else []
    required_skills = job.required_skills

    # Use AI for deep analysis
    analysis_prompt = f"""
    Analyze skill gaps and provide comprehensive learning recommendations:
    
    CANDIDATE SKILLS: {candidate_skills}
    REQUIRED SKILLS: {required_skills}
    JOB DESCRIPTION: {job.job_description}
    
    Provide analysis in JSON format:
    {{
        "skill_gap_analysis": {{
            "critical_gaps": ["gap1", "gap2"],
            "moderate_gaps": ["gap3", "gap4"],
            "strengths": ["strength1", "strength2"],
            "overall_readiness": 65
        }},
        "learning_recommendations": {{
            "immediate_priorities": [
                {{
                    "skill": "skill_name",
                    "urgency": "high",
                    "estimated_time": "4-6 weeks",
                    "learning_resources": ["resource1", "resource2"],
                    "practice_projects": ["project1", "project2"]
                }}
            ],
            "medium_term_goals": [
                {{
                    "skill": "skill_name",
                    "timeline": "2-3 months",
                    "learning_path": ["step1", "step2", "step3"]
                }}
            ]
        }},
        "market_value_impact": {{
            "salary_increase_potential": "15-20%",
            "marketability_boost": "significant",
            "career_acceleration": "6-12 months"
        }},
        "certification_recommendations": [
            {{
                "certification": "cert_name",
                "provider": "provider_name",
                "cost": "$$",
                "time_commitment": "2-3 months",
                "roi": "high"
            }}
        ]
    }}
    """

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sambanova.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('SAMBA_NOVA_API_KEY')}", "Content-Type": "application/json"},
            json={
                "model": "Meta-Llama-3.1-70B-Instruct",
                "messages": [{"role": "user", "content": analysis_prompt}],
                "temperature": 0.3,
                "max_tokens": 1200
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            analysis = json.loads(result["choices"][0]["message"]["content"])
        else:
            analysis = {"error": "Failed to analyze skill gaps"}

    return {
        "candidate_name": candidate.name,
        "job_title": job.job_title,
        "skill_gap_analysis": analysis
    }


@router.get("/personalized-learning-plan")
async def get_personalized_learning_plan(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["candidate"])),
):
    """AI-powered personalized learning plan based on career goals"""
    candidate = db.scalar(select(Candidate).where(Candidate.user_id == user.id))
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    # Get candidate's applications to understand career direction
    apps = db.scalars(select(Application).where(Application.candidate_id == candidate.id)).all()
    
    # Create learning plan prompt
    learning_prompt = f"""
    Create a comprehensive personalized learning and development plan:
    
    CANDIDATE PROFILE:
    Name: {candidate.name}
    Skills: {candidate.skills or 'Not specified'}
    Education: {candidate.education or 'Not specified'}
    Experience: {candidate.experience or 'Not specified'}
    Application History: {len(apps)} applications
    
    Provide learning plan in JSON format:
    {{
        "learning_assessment": {{
            "current_skill_level": "intermediate",
            "learning_style": "visual/auditory/kinesthetic/mixed",
            "time_availability": "5-10 hours/week",
            "budget_range": "low/medium/high"
        }},
        "skill_roadmap": [
            {{
                "skill_category": "Technical Skills",
                "priority": "high",
                "specific_skills": [
                    {{
                        "skill": "skill_name",
                        "current_level": 3,
                        "target_level": 7,
                        "learning_resources": [
                            {{
                                "type": "course",
                                "name": "course_name",
                                "provider": "provider_name",
                                "duration": "6 weeks",
                                "cost": "$$",
                                "difficulty": "intermediate"
                            }}
                        ],
                        "practice_projects": ["project1", "project2"],
                        "success_metrics": ["metric1", "metric2"]
                    }}
                ]
            }}
        ],
        "timeline_roadmap": [
            {{
                "quarter": "Q1 2024",
                "focus_areas": ["area1", "area2"],
                "learning_goals": ["goal1", "goal2"],
                "milestone_projects": ["project1", "project2"]
            }}
        ],
        "career_advancement_strategy": {{
            "short_term_goals": ["goal1", "goal2"],
            "long_term_vision": "vision_description",
            "networking_strategy": ["strategy1", "strategy2"],
            "personal_branding": ["branding1", "branding2"]
        }},
        "success_tracking": {{
            "kpi_metrics": ["metric1", "metric2"],
            "review_frequency": "monthly",
            "adjustment_triggers": ["trigger1", "trigger2"]
        }}
    }}
    """

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sambanova.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('SAMBA_NOVA_API_KEY')}", "Content-Type": "application/json"},
            json={
                "model": "Meta-Llama-3.1-70B-Instruct",
                "messages": [{"role": "user", "content": learning_prompt}],
                "temperature": 0.3,
                "max_tokens": 1500
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            learning_plan = json.loads(result["choices"][0]["message"]["content"])
        else:
            learning_plan = {"error": "Failed to generate learning plan"}

    return {
        "candidate_name": candidate.name,
        "personalized_learning_plan": learning_plan
    }
