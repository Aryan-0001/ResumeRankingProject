from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field
import enum


UserRole = Literal["candidate", "company"]


class ApplicationStatusEnum(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CandidateProfileOut(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    resume_path: Optional[str] = None


class CompanyProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: Optional[str] = None
    description: Optional[str] = None


class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    description: Optional[str] = None


class JobCreate(BaseModel):
    job_title: str = Field(min_length=2, max_length=250)
    job_description: str = Field(min_length=20)
    required_skills: list[str] = Field(default_factory=list)


class JobUpdate(BaseModel):
    job_title: Optional[str] = Field(default=None, min_length=2, max_length=250)
    job_description: Optional[str] = Field(default=None, min_length=20)
    required_skills: Optional[list[str]] = None


class JobOut(BaseModel):
    id: int
    company_id: int
    job_title: str
    job_description: str
    required_skills: list[str]
    location: Optional[str] = None
    salary: Optional[str] = None
    company: Optional[str] = None
    ai_match_score: Optional[float] = None
    ai_insights: Optional[dict] = None
    
    class Config:
        from_attributes = True
        
    # Alias for frontend compatibility
    @property
    def title(self):
        return self.job_title
    
    def get_skills(self):
        return ','.join(self.required_skills) if self.required_skills else ''


class ApplicationOut(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    resume_score: Optional[float] = None
    fit_percentage: Optional[float] = None
    status: str
    ai_insights: Optional[dict] = None
    candidate_name: Optional[str] = None
    candidate_skills: Optional[str] = None
    job_title: Optional[str] = None


class SetApplicationStatus(BaseModel):
    status: ApplicationStatusEnum


class JobFitOut(BaseModel):
    application_id: int
    job_id: int
    resume_score: float
    fit_percentage: float
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]
    explanation: dict


class RankedApplicationOut(BaseModel):
    application_id: int
    candidate_id: int
    job_id: int
    resume_score: float
    fit_percentage: float
    status: str
    matched_skills: list[str]
    missing_skills: list[str]


class RankResumesOut(BaseModel):
    job_id: int
    ranked: list[RankedApplicationOut]
