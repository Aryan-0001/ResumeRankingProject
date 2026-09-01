from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import settings
from database.base import Base

engine = create_engine(settings.resolved_database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    settings.upload_dir_path.mkdir(parents=True, exist_ok=True)

    # Import models so SQLAlchemy registers them before create_all.
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
