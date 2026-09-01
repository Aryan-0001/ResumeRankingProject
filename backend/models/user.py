from __future__ import annotations

import enum

from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class UserRole(str, enum.Enum):
    candidate = "candidate"
    company = "company"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)

    candidate_profile = relationship("Candidate", back_populates="user", uselist=False)
    company_profile = relationship("Company", back_populates="user", uselist=False)
