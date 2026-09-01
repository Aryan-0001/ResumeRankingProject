from __future__ import annotations

from pathlib import Path

import pdfplumber
from docx import Document


def extract_text_from_pdf(path: str) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text() or ""
            if t.strip():
                text_parts.append(t)
    return "\n".join(text_parts).strip()


def extract_text_from_docx(path: str) -> str:
    doc = Document(path)
    parts: list[str] = []
    for p in doc.paragraphs:
        if p.text and p.text.strip():
            parts.append(p.text)
    return "\n".join(parts).strip()


def extract_resume_text(path: str) -> str:
    ext = Path(path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(path)
    if ext == ".docx":
        return extract_text_from_docx(path)
    raise ValueError("Unsupported resume format")
