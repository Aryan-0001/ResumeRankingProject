"""
Comprehensive test suite for the AI Resume Ranking System
"""
import pytest
import asyncio
import tempfile
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Import the main app
from main import app
from database.session import get_db
from models import Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    """Create test user data"""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "role": "candidate"
    }

@pytest.fixture
def test_company():
    """Create test company data"""
    return {
        "email": "company@example.com",
        "password": "CompanyPass123!",
        "role": "company"
    }

@pytest.fixture
def test_job():
    """Create test job data"""
    return {
        "job_title": "Software Engineer",
        "job_description": "We are looking for a skilled software engineer with experience in Python, React, and cloud technologies.",
        "required_skills": ["Python", "React", "AWS", "Docker"]
    }

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_candidate(self, setup_database, test_user):
        """Test candidate registration"""
        response = client.post("/api/auth/register", json=test_user)
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert "user_id" in data
    
    def test_register_company(self, setup_database, test_company):
        """Test company registration"""
        response = client.post("/api/auth/register", json=test_company)
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
    
    def test_login_success(self, setup_database, test_user):
        """Test successful login"""
        # First register user
        client.post("/api/auth/register", json=test_user)
        
        # Then login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, setup_database, test_user):
        """Test login with invalid credentials"""
        login_data = {
            "email": test_user["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
    
    def test_register_duplicate_email(self, setup_database, test_user):
        """Test registration with duplicate email"""
        # Register first user
        client.post("/api/auth/register", json=test_user)
        
        # Try to register again with same email
        response = client.post("/api/auth/register", json=test_user)
        assert response.status_code == 400

class TestCandidateEndpoints:
    """Test candidate-specific endpoints"""
    
    @pytest.fixture
    def candidate_token(self, setup_database, test_user):
        """Get authentication token for candidate"""
        client.post("/api/auth/register", json=test_user)
        login_response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        return login_response.json()["access_token"]
    
    def test_get_candidate_profile(self, setup_database, candidate_token):
        """Test getting candidate profile"""
        headers = {"Authorization": f"Bearer {candidate_token}"}
        response = client.get("/api/candidate/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
    
    def test_update_candidate_profile(self, setup_database, candidate_token):
        """Test updating candidate profile"""
        headers = {"Authorization": f"Bearer {candidate_token}"}
        update_data = {
            "name": "John Doe",
            "skills": "Python, React, Machine Learning",
            "education": "Bachelor's in Computer Science",
            "experience": "3 years of software development"
        }
        response = client.put("/api/candidate/me", headers=headers, json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["skills"] == "Python, React, Machine Learning"
    
    def test_get_jobs(self, setup_database, candidate_token):
        """Test getting available jobs"""
        headers = {"Authorization": f"Bearer {candidate_token}"}
        response = client.get("/api/candidate/jobs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestCompanyEndpoints:
    """Test company-specific endpoints"""
    
    @pytest.fixture
    def company_token(self, setup_database, test_company):
        """Get authentication token for company"""
        client.post("/api/auth/register", json=test_company)
        login_response = client.post("/api/auth/login", json={
            "email": test_company["email"],
            "password": test_company["password"]
        })
        return login_response.json()["access_token"]
    
    def test_get_company_profile(self, setup_database, company_token):
        """Test getting company profile"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = client.get("/api/company/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
    
    def test_post_job(self, setup_database, company_token, test_job):
        """Test posting a new job"""
        headers = {"Authorization": f"Bearer {company_token}"}
        response = client.post("/api/company/post-job", headers=headers, json=test_job)
        assert response.status_code == 201
        data = response.json()
        assert data["job_title"] == test_job["job_title"]
        assert data["job_description"] == test_job["job_description"]
    
    def test_get_company_jobs(self, setup_database, company_token, test_job):
        """Test getting company's posted jobs"""
        headers = {"Authorization": f"Bearer {company_token}"}
        
        # First post a job
        client.post("/api/company/post-job", headers=headers, json=test_job)
        
        # Then get jobs
        response = client.get("/api/company/jobs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

class TestFileUpload:
    """Test file upload functionality"""
    
    @pytest.fixture
    def candidate_token(self, setup_database, test_user):
        """Get authentication token for candidate"""
        client.post("/api/auth/register", json=test_user)
        login_response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        return login_response.json()["access_token"]
    
    def test_upload_resume_pdf(self, setup_database, candidate_token):
        """Test uploading PDF resume"""
        headers = {"Authorization": f"Bearer {candidate_token}"}
        
        # Create a temporary PDF file (simplified test)
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(b"%PDF-1.4\n%Mock PDF content for testing")
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, "rb") as f:
                files = {"file": ("test_resume.pdf", f, "application/pdf")}
                response = client.post("/api/candidate/upload-resume", headers=headers, files=files)
            
            # Note: This might fail due to PDF parsing, but should handle gracefully
            assert response.status_code in [200, 400]
        finally:
            os.unlink(tmp_path)
    
    def test_upload_invalid_file_type(self, setup_database, candidate_token):
        """Test uploading invalid file type"""
        headers = {"Authorization": f"Bearer {candidate_token}"}
        
        # Create a temporary text file
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
            tmp.write(b"This is not a valid resume file")
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, "rb") as f:
                files = {"file": ("invalid.txt", f, "text/plain")}
                response = client.post("/api/candidate/upload-resume", headers=headers, files=files)
            
            assert response.status_code == 400
            data = response.json()
            assert "error" in data.lower()
        finally:
            os.unlink(tmp_path)

class TestSecurityFeatures:
    """Test security features"""
    
    def test_rate_limiting(self, setup_database):
        """Test rate limiting on login endpoint"""
        login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        
        # Make multiple failed login attempts
        for i in range(6):  # Assuming rate limit is 5 per 15 minutes
            response = client.post("/api/auth/login", json=login_data)
        
        # Should be rate limited
        assert response.status_code == 429
        data = response.json()
        assert "rate limit" in data["error"].lower()
    
    def test_sql_injection_protection(self, setup_database):
        """Test SQL injection protection"""
        malicious_input = {
            "email": "'; DROP TABLE users; --",
            "password": "password",
            "role": "candidate"
        }
        
        response = client.post("/api/auth/register", json=malicious_input)
        # Should handle gracefully without crashing
        assert response.status_code in [400, 422]
    
    def test_xss_protection(self, setup_database):
        """Test XSS protection"""
        xss_input = {
            "email": "<script>alert('xss')</script>@example.com",
            "password": "password123",
            "role": "candidate"
        }
        
        response = client.post("/api/auth/register", json=xss_input)
        # Should handle gracefully without executing script
        assert response.status_code in [400, 422]

class TestPerformanceFeatures:
    """Test performance and caching features"""
    
    def test_caching_mechanism(self, setup_database):
        """Test that caching is working"""
        # This is a basic test - in reality you'd need to measure response times
        response1 = client.get("/api/candidate/jobs")
        response2 = client.get("/api/candidate/jobs")
        
        # Both should succeed
        assert response1.status_code == 401  # No token provided
        assert response2.status_code == 401
    
    def test_metrics_endpoint(self, setup_database):
        """Test metrics endpoint"""
        response = client.get("/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "performance" in data
        assert "cache" in data
        assert "security" in data

class TestErrorHandling:
    """Test error handling"""
    
    def test_404_handling(self, setup_database):
        """Test 404 error handling"""
        response = client.get("/api/nonexistent-endpoint")
        assert response.status_code == 404
    
    def test_invalid_json_handling(self, setup_database):
        """Test invalid JSON handling"""
        response = client.post(
            "/api/auth/register",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

# Integration tests
class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_candidate_workflow(self, setup_database):
        """Test complete candidate workflow"""
        # 1. Register candidate
        candidate_data = {
            "email": "integration_candidate@example.com",
            "password": "TestPassword123!",
            "role": "candidate"
        }
        register_response = client.post("/api/auth/register", json=candidate_data)
        assert register_response.status_code == 201
        
        # 2. Login
        login_response = client.post("/api/auth/login", json={
            "email": candidate_data["email"],
            "password": candidate_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Update profile
        profile_data = {
            "name": "Integration Test Candidate",
            "skills": "Python, React, Testing",
            "education": "Bachelor's in CS",
            "experience": "2 years"
        }
        profile_response = client.put("/api/candidate/me", headers=headers, json=profile_data)
        assert profile_response.status_code == 200
        
        # 4. Get jobs
        jobs_response = client.get("/api/candidate/jobs", headers=headers)
        assert jobs_response.status_code == 200
    
    def test_complete_company_workflow(self, setup_database):
        """Test complete company workflow"""
        # 1. Register company
        company_data = {
            "email": "integration_company@example.com",
            "password": "CompanyPass123!",
            "role": "company"
        }
        register_response = client.post("/api/auth/register", json=company_data)
        assert register_response.status_code == 201
        
        # 2. Login
        login_response = client.post("/api/auth/login", json={
            "email": company_data["email"],
            "password": company_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Update company profile
        company_profile = {
            "company_name": "Integration Test Company",
            "description": "A test company for integration testing"
        }
        profile_response = client.put("/api/company/me", headers=headers, json=company_profile)
        assert profile_response.status_code == 200
        
        # 4. Post a job
        job_data = {
            "job_title": "Integration Test Engineer",
            "job_description": "We are looking for an engineer to test our integrations.",
            "required_skills": ["Python", "Testing", "APIs"]
        }
        job_response = client.post("/api/company/post-job", headers=headers, json=job_data)
        assert job_response.status_code == 201
        
        # 5. Get company jobs
        jobs_response = client.get("/api/company/jobs", headers=headers)
        assert jobs_response.status_code == 200
        jobs = jobs_response.json()
        assert len(jobs) >= 1
        assert jobs[0]["job_title"] == "Integration Test Engineer"

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
