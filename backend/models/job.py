from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)

    job_title: Mapped[str] = mapped_column(String(250), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=True)
    salary: Mapped[str] = mapped_column(String(100), nullable=True)

    # Stored as a list of skills, e.g. ["python", "fastapi", "nlp"]
    required_skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
