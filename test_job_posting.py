import requests
import json

# Test job posting
base_url = "http://localhost:8000/api"

# First login as company
login_data = {
    "email": "testcompany@demo.com",
    "password": "test123"
}

print("🔐 Logging in as company...")
login_response = requests.post(f"{base_url}/auth/login", json=login_data)

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test job posting with valid data
    job_data = {
        "job_title": "Senior Software Engineer",
        "job_description": "We are looking for a talented senior software engineer with experience in full-stack development, cloud technologies, and team leadership. The ideal candidate will have 5+ years of experience and be passionate about building scalable applications.",
        "required_skills": ["Python", "JavaScript", "React", "Node.js", "AWS"]
    }
    
    print("\n📝 Posting job with valid data...")
    job_response = requests.post(f"{base_url}/company/post-job", json=job_data, headers=headers)
    
    if job_response.status_code == 201:
        print("✅ Job posted successfully!")
        print(f"Job details: {json.dumps(job_response.json(), indent=2)}")
    else:
        print(f"❌ Job posting failed: {job_response.status_code}")
        print(f"Error: {job_response.text}")
    
    # Test with invalid data (short description)
    invalid_job_data = {
        "job_title": "Test",
        "job_description": "Too short",
        "required_skills": ["Python"]
    }
    
    print("\n📝 Testing with invalid data (short description)...")
    invalid_response = requests.post(f"{base_url}/company/post-job", json=invalid_job_data, headers=headers)
    
    if invalid_response.status_code == 422:
        print("✅ Validation correctly rejected invalid data")
        print(f"Validation error: {invalid_response.text}")
    else:
        print(f"❌ Expected validation error but got: {invalid_response.status_code}")
        
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"Error: {login_response.text}")
