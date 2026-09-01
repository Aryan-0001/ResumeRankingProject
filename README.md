# AI-Based Resume Ranking and Job Fit Prediction System

A full-stack recruitment project that ranks resumes against job descriptions and estimates candidate-job fit using NLP and machine learning.

The application has separate candidate and company workflows. Candidates can upload resumes and apply to jobs, while companies can post openings, review applicants, and view ranking and fit scores.

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, Material UI, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy, JWT authentication
- **Database:** SQLite for the default local setup; PostgreSQL can also be configured
- **NLP / ML:** spaCy, TF-IDF, scikit-learn, sentence-transformers, cosine similarity

## Main Features

- Candidate and company registration/login
- Role-based access control
- Resume upload for PDF and DOCX files
- Job posting and application management
- Resume-to-job similarity scoring
- Candidate ranking for each job
- Job-fit prediction using engineered features
- Candidate and company dashboards
- REST API backend with a React frontend

## How the Ranking Works

Resume text is extracted and preprocessed before being compared with the job description.

The ranking pipeline uses:

- TF-IDF similarity
- BERT sentence embeddings (`all-MiniLM-L6-v2`)
- cosine similarity
- skill overlap
- simple experience and education matching features

The project combines the similarity signals into a normalized score and uses a supervised model for job-fit prediction.

## Project Structure

```text
frontend/              React frontend
backend/
  auth/                authentication and JWT helpers
  database/            database session and setup
  ml/                  resume parsing, ranking and fit prediction
  models/              SQLAlchemy models
  routes/              API routes
  utils/               shared utilities and schemas
tests/                 Playwright tests
```

## Running Locally

### Backend

Create a virtual environment and install the Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and update any values you want to change.

The application can run with SQLite locally. If you prefer PostgreSQL, set the appropriate `DATABASE_URL` in `backend/.env`.

Start the backend:

```bash
cd backend
uvicorn main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

Windows launch scripts are also included in the repository.

## Typical Flow

1. Register a company account.
2. Post a job with a description and required skills.
3. Register a candidate account.
4. Upload a resume.
5. Apply to the job.
6. Open the company dashboard to view ranked applicants.
7. View the fit score and matching details for an application.

## Notes

- Local database files, uploaded resumes, environment files, logs and other generated files are excluded from the repository.
- The ranking and fit scores are intended as decision-support signals rather than a replacement for human review.

---
---

## Images
<img width="1917" height="918" alt="image" src="https://github.com/user-attachments/assets/7499c6b8-314f-4249-89b1-2c685e4fd0cf" />
<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/c08b13c1-db5a-4ac9-8157-412369371eda" />
<img width="1917" height="930" alt="image" src="https://github.com/user-attachments/assets/5aeb6cb5-fd3c-499a-b5fb-c44cec283a5b" />
<img width="1917" height="925" alt="image" src="https://github.com/user-attachments/assets/743c60dd-b04a-44d1-bd7a-bed1c3480783" />

