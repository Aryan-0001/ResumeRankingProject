from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    skills: Mapped[str | None] = mapped_column(Text, nullable=True)
    education: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("Application", back_populates="candidate")
