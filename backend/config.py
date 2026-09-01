from __future__ import annotations

from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8")

    database_url: str = Field(default="sqlite:///./recruitment.db")
    jwt_secret_key: str = Field(default="dev-secret-key")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=120)
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")
    upload_dir: str = Field(default="uploads")
    spacy_model: str = Field(default="en_core_web_sm")
    gemini_api_key: str = Field(default="")

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def upload_dir_path(self) -> Path:
        path = Path(self.upload_dir)
        if path.is_absolute():
            return path
        return BASE_DIR / path

    @property
    def resolved_database_url(self) -> str:
        if not self.database_url.startswith("sqlite:///"):
            return self.database_url

        raw_path = self.database_url.removeprefix("sqlite:///")
        path = Path(raw_path)
        if not path.is_absolute():
            path = BASE_DIR / path
        return f"sqlite:///{path.resolve().as_posix()}"


settings = Settings()
