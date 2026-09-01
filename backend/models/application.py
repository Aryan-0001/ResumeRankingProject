from __future__ import annotations

import enum

from sqlalchemy import Enum, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), nullable=False, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False, index=True)

    resume_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fit_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.applied)

    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
