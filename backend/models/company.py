from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    company_name: Mapped[str | None] = mapped_column(String(250), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="company_profile")
    jobs = relationship("Job", back_populates="company")
