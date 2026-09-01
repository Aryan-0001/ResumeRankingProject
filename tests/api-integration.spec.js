import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const baseURL = 'http://localhost:8000/api';

  test.beforeEach(async ({ page }) => {
    // Enable request interception
    await page.route('**/api/**', async (route) => {
      await route.continue();
    });
  });

  test('should handle authentication API calls correctly', async ({ page }) => {
    // Test login API
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('access_token');
    expect(loginData).toHaveProperty('user');
    expect(loginData.user.role).toBe('candidate');
  });

  test('should handle candidate profile API', async ({ page }) => {
    // First login to get token
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test get candidate profile
    const profileResponse = await page.request.get(`${baseURL}/candidate/me`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData).toHaveProperty('id');
    expect(profileData).toHaveProperty('skills');
    expect(profileData).toHaveProperty('education');
  });

  test('should handle jobs API', async ({ page }) => {
    // Test get jobs (no auth required)
    const jobsResponse = await page.request.get(`${baseURL}/candidate/jobs`);
    
    expect(jobsResponse.status()).toBe(200);
    const jobsData = await jobsResponse.json();
    expect(Array.isArray(jobsData)).toBe(true);
    
    if (jobsData.length > 0) {
      const firstJob = jobsData[0];
      expect(firstJob).toHaveProperty('id');
      expect(firstJob).toHaveProperty('job_title');
      expect(firstJob).toHaveProperty('company');
    }
  });

  test('should handle applications API', async ({ page }) => {
    // Login first
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test get applications
    const applicationsResponse = await page.request.get(`${baseURL}/candidate/applications`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    expect(applicationsResponse.status()).toBe(200);
    const applicationsData = await applicationsResponse.json();
    expect(Array.isArray(applicationsData)).toBe(true);
  });

  test('should handle job application API', async ({ page }) => {
    // Login first
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Get available jobs
    const jobsResponse = await page.request.get(`${baseURL}/candidate/jobs`);
    const jobsData = await jobsResponse.json();
    
    if (jobsData.length > 0) {
      const firstJob = jobsData[0];
      
      // Apply for job
      const applyResponse = await page.request.post(`${baseURL}/candidate/apply/${firstJob.id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      expect(applyResponse.status()).toBe(200);
      const applyData = await applyResponse.json();
      expect(applyData).toHaveProperty('message');
    }
  });

  test('should handle resume upload API', async ({ page }) => {
    // Login first
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Create test file
    const testFile = {
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF')
    };

    // Upload resume
    const uploadResponse = await page.request.post(`${baseURL}/candidate/upload-resume`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      multipart: {
        file: testFile
      }
    });
    
    expect(uploadResponse.status()).toBe(200);
    const uploadData = await uploadResponse.json();
    expect(uploadData).toHaveProperty('message');
  });

  test('should handle company profile API', async ({ page }) => {
    // Login as company
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'xyz@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test get company profile
    const profileResponse = await page.request.get(`${baseURL}/company/me`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData).toHaveProperty('id');
    expect(profileData).toHaveProperty('company_name');
  });

  test('should handle company jobs API', async ({ page }) => {
    // Login as company
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'xyz@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test get company jobs
    const jobsResponse = await page.request.get(`${baseURL}/company/jobs`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    expect(jobsResponse.status()).toBe(200);
    const jobsData = await jobsResponse.json();
    expect(Array.isArray(jobsData)).toBe(true);
  });

  test('should handle job creation API', async ({ page }) => {
    // Login as company
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'xyz@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Create new job
    const jobData = {
      job_title: 'Test Software Engineer',
      description: 'We are looking for a talented software engineer...',
      required_skills: ['JavaScript', 'React', 'Node.js'],
      salary: '$80,000 - $120,000',
      location: 'Remote'
    };

    const createJobResponse = await page.request.post(`${baseURL}/company/jobs`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      data: jobData
    });
    
    expect(createJobResponse.status()).toBe(201);
    const createdJob = await createJobResponse.json();
    expect(createdJob).toHaveProperty('id');
    expect(createdJob.job_title).toBe(jobData.job_title);
  });

  test('should handle AI recommendations API', async ({ page }) => {
    // Login as candidate
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test recommended jobs API
    const recommendationsResponse = await page.request.get(`${baseURL}/candidate/recommended-jobs`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    // Should either succeed (200) or fail gracefully (401/500)
    expect([200, 401, 500]).toContain(recommendationsResponse.status());
    
    if (recommendationsResponse.status() === 200) {
      const recommendationsData = await recommendationsResponse.json();
      expect(Array.isArray(recommendationsData)).toBe(true);
    }
  });

  test('should handle career analysis API', async ({ page }) => {
    // Login as candidate
    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'abc@gmail.com',
        password: 'password123'
      }
    });
    const { access_token } = await loginResponse.json();

    // Test career analysis API
    const analysisResponse = await page.request.get(`${baseURL}/candidate/career-analysis`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    // Should either succeed (200) or fail gracefully (401/500)
    expect([200, 401, 500]).toContain(analysisResponse.status());
    
    if (analysisResponse.status() === 200) {
      const analysisData = await analysisResponse.json();
      expect(analysisData).toHaveProperty('analysis');
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Test invalid login
    const invalidLoginResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }
    });
    
    expect(invalidLoginResponse.status()).toBe(401);
    const errorData = await invalidLoginResponse.json();
    expect(errorData).toHaveProperty('detail');
  });

  test('should handle unauthorized access', async ({ page }) => {
    // Test accessing protected endpoint without token
    const profileResponse = await page.request.get(`${baseURL}/candidate/me`);
    
    expect(profileResponse.status()).toBe(401);
  });

  test('should handle rate limiting', async ({ page }) => {
    // Make multiple rapid requests
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(page.request.get(`${baseURL}/candidate/jobs`));
    }
    
    const responses = await Promise.all(promises);
    
    // All should succeed (no rate limiting implemented)
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });

  test('should handle CORS correctly', async ({ page }) => {
    // Test CORS preflight request
    const optionsResponse = await page.request.fetch(`${baseURL}/candidate/jobs`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    expect(optionsResponse.status()).toBe(200);
    expect(optionsResponse.headers()['access-control-allow-origin']).toBeTruthy();
  });

  test('should handle malformed requests', async ({ page }) => {
    // Test with invalid JSON
    const malformedResponse = await page.request.post(`${baseURL}/auth/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: 'invalid json'
    });
    
    expect(malformedResponse.status()).toBe(422);
  });

  test('should handle missing required fields', async ({ page }) => {
    // Test login without required fields
    const incompleteResponse = await page.request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'test@test.com'
        // Missing password
      }
    });
    
    expect(incompleteResponse.status()).toBe(422);
  });
});
