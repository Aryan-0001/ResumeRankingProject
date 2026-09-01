# AI-Based Resume Ranking and Job Fit Prediction System

A complete, demo-ready recruitment platform for final-year CS/AI projects.

## Tech Stack

- Frontend: React (Vite), React Router, Axios, Recharts, Material UI
- Backend: Python, FastAPI, JWT Auth, Role-based access control
- Database: PostgreSQL (SQLAlchemy)
- NLP/ML: spaCy, TF-IDF (scikit-learn), BERT embeddings (sentence-transformers), cosine similarity

## Why PostgreSQL?

PostgreSQL is chosen because it provides:

- Strong relational integrity for core entities (users, jobs, applications)
- ACID guarantees that reduce consistency bugs in recruitment workflows
- Mature tooling and performance for analytics queries used in dashboards

## Project Structure

- `frontend/` React web app
- `backend/` FastAPI server
  - `auth/` authentication + RBAC
  - `database/` SQLAlchemy session + DB init
  - `models/` ORM models
  - `ml/` resume parsing, ranking, and fit prediction
  - `routes/` API routes
  - `utils/` shared utilities + schemas

## Quickstart (Local)

### 1) Backend

1. Create a PostgreSQL database (example): `ai_resume_ranker`
2. Create `.env` in `backend/` based on `.env.example`
3. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

4. Run API:

```bash
uvicorn backend.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Academic Write-up (Included)

This repository will include:

- Abstract
- Problem statement
- System architecture
- Algorithms used
- Experimental results
- Future scope

## Abstract

Recruitment teams often receive large volumes of resumes per job posting, causing manual screening to become time-consuming, inconsistent, and error-prone. This project presents an AI-based recruitment platform that integrates resume parsing, semantic similarity ranking, and supervised job-fit prediction into an end-to-end web system. Candidates can upload resumes and apply to jobs, while companies can post job descriptions, view ranked applicants, and shortlist/reject candidates. The system combines TF-IDF and BERT embeddings to compute resume–job similarity and uses a supervised classifier (Logistic Regression / Random Forest) to estimate job-fit probability with feature-level explanations.

## Problem Statement

Design and implement a complete recruitment platform that:

- Supports role-based users (Candidate, Company)
- Allows candidates to upload resumes (PDF/DOCX) and apply to jobs
- Allows companies to post jobs and manage applications
- Automatically ranks resumes per job and predicts job-fit (%)
- Provides dashboards with analytics and interpretability

## System Architecture

### High-Level Components

- **Frontend (React + MUI)**
  - Authentication (register/login)
  - Candidate Dashboard (profile, resume upload, jobs, applications, fit analytics)
  - Company Dashboard (post jobs, ranked applicants, shortlist/reject, fit details)

- **Backend (FastAPI)**
  - JWT authentication + role-based access control (RBAC)
  - REST API routes for candidates/companies
  - File upload for resumes
  - ML services for ranking and fit prediction

- **Database (PostgreSQL)**
  - Relational schema with strong integrity constraints across Users, Jobs, Applications

### Data Flow (End-to-End)

1. Candidate registers (role=candidate) → candidate profile is created
2. Company registers (role=company) → company profile is created
3. Company posts a job (title, description, required skills)
4. Candidate uploads resume (PDF/DOCX)
5. Candidate applies to a job → application is created
6. When candidate/company requests scoring:
   - Resume text is extracted (PDF/DOCX)
   - NLP preprocessing is applied (stopwords, lemmatization)
   - TF-IDF similarity and BERT similarity are computed
   - Combined score is normalized (0–100)
   - Fit model predicts probability (%) using engineered features
   - Results are stored in `applications.resume_score` and `applications.fit_percentage`

## Database Design (Schema)

### Users

- `id` (PK)
- `email` (unique)
- `password_hash`
- `role` (candidate/company)

### Candidates

- `id` (PK)
- `user_id` (FK → users.id, unique)
- `name`
- `skills` (free text)
- `education` (free text)
- `experience` (free text)
- `resume_path` (file path)

### Companies

- `id` (PK)
- `user_id` (FK → users.id, unique)
- `company_name`
- `description`

### Jobs

- `id` (PK)
- `company_id` (FK → companies.id)
- `job_title`
- `job_description`
- `required_skills` (JSON list)

### Applications

- `id` (PK)
- `candidate_id` (FK → candidates.id)
- `job_id` (FK → jobs.id)
- `resume_score` (0–100)
- `fit_percentage` (0–100)
- `status` (applied/shortlisted/rejected)

## REST API (Implemented)

Base URL: `http://127.0.0.1:8000/api`

### Auth

- `POST /auth/register` (email, password, role)
- `POST /auth/login` → JWT token

### Candidate

- `GET /candidate/me`
- `PUT /candidate/me`
- `POST /candidate/upload-resume` (multipart)
- `GET /candidate/jobs`
- `POST /candidate/apply/{job_id}`
- `GET /candidate/applications`
- `GET /candidate/job-fit?application_id=...`

### Company

- `GET /company/me`
- `PUT /company/me`
- `POST /company/post-job`
- `GET /company/jobs`
- `GET /company/applications?job_id=...`
- `PATCH /company/applications/{application_id}/status`
- `GET /company/rank-resumes?job_id=...`
- `GET /company/predict-fit?application_id=...`

## NLP & Machine Learning

### Resume Parsing

- **PDF**: `pdfplumber`
- **DOCX**: `python-docx`

### NLP Preprocessing (spaCy)

- Text normalization
- Stopword removal
- Lemmatization

### Skill Extraction

Skills are extracted via a lightweight **catalog-based matching** against a predefined skills list (extendable). This ensures deterministic and explainable extraction suitable for academic demos.

### Resume Ranking Model

For each resume against a job description:

- **TF-IDF Vectorization** → cosine similarity
- **BERT Sentence Embeddings** (`all-MiniLM-L6-v2`) → cosine similarity
- **Combined Score** = 0.5 * TF-IDF(norm) + 0.5 * BERT(norm)
- Output normalized to **0–100**

### Job Fit Prediction Model (Supervised)

Features:

- `resume_jd_similarity` (combined score scaled to 0–1)
- `skill_overlap` (intersection/required)
- `experience_match` (heuristic from “X years” patterns)
- `education_relevance` (heuristic mapping based on degree keywords)

Models trained:

- Logistic Regression
- Random Forest

The training script evaluates both and persists the best model.

## Experimental Setup / Evaluation (Academic)

Recommended evaluation you can report:

- **Ranking quality**
  - Collect small labeled pairs (resume relevant/not relevant) for a few job descriptions
  - Report Precision@K / NDCG@K

- **Fit prediction quality**
  - If you build a labeled dataset: report Accuracy, F1, ROC-AUC
  - If not: report controlled experiments using synthetic labels + qualitative case studies

## Running the Project (Demo Steps)

### Prerequisites

- Python 3.10+
- Node.js 18+
- No database setup required for the default local demo, because `backend/.env` points to a SQLite file. If you want PostgreSQL, update `backend/.env` accordingly.

### Backend Setup

1. Create PostgreSQL DB:

```sql
CREATE DATABASE ai_resume_ranker;
```

2. Configure `backend/.env` if you want to change the database, JWT secret, CORS, or upload folder. The repo already includes a working dev file.

3. Install Python deps:

```bash
pip install -r backend/requirements.txt
```

4. Install the Python dependencies. The app now falls back gracefully if the spaCy model is not installed, so this extra download is optional.

5. (Optional) Train and persist the fit model artifacts:

```bash
python -m backend.ml.train_fit_model
```

6. Run the API from the `backend/` directory:

```bash
cd backend
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

If you prefer the Windows launchers, use `start_backend.bat` and `start_frontend.bat` from the repo root.

### Demo Script

1. Register a **Company** account
2. Post a job with description + required skills
3. Register a **Candidate** account
4. Upload a resume (PDF/DOCX)
5. Apply to the job
6. Company dashboard → select the job → view ranked applications
7. Open “Predict Fit” to see fit percentage, missing skills, and explanation

## Future Scope

- Multi-file resume parsing (projects, certifications)
- Advanced skill extraction using NER and section-aware parsing
- Real labeled dataset training + explainable AI (SHAP/LIME)
- Vector database for large-scale semantic search
- Bias/fairness auditing and anonymized screening
