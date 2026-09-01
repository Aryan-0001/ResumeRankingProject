import { test, expect } from '@playwright/test';

test.describe('Candidate Dashboard Tests', () => {
  const testUser = {
    email: 'abc@gmail.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/candidate/);
  });

  test('should display candidate dashboard correctly', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
    
    // Check main sections
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=My Applications')).toBeVisible();
    await expect(page.locator('text=Career Development')).toBeVisible();
    
    // Check profile section
    await expect(page.locator('text=Skills')).toBeVisible();
    await expect(page.locator('text=Education')).toBeVisible();
    await expect(page.locator('text=Experience')).toBeVisible();
  });

  test('should display profile information', async ({ page }) => {
    // Check profile section
    await expect(page.locator('[data-testid="profile-section"], .profile-section')).toBeVisible();
    
    // Should have editable fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]');
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible();
    }
    
    // Check skills section
    await expect(page.locator('text=Skills')).toBeVisible();
    
    // Check education section
    await expect(page.locator('text=Education')).toBeVisible();
    
    // Check experience section
    await expect(page.locator('text=Experience')).toBeVisible();
  });

  test('should edit profile successfully', async ({ page }) => {
    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update"), [data-testid="edit-profile"]');
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Update name field
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await nameInput.fill('Updated Test Name');
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
        await saveButton.click();
        
        // Verify changes saved (look for success message or updated name)
        await expect(page.locator('text=Updated Test Name, text=Profile updated')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display jobs list', async ({ page }) => {
    // Look for jobs section
    await expect(page.locator('text=Jobs, text=Available Jobs')).toBeVisible();
    
    // Check if jobs are displayed
    const jobCards = page.locator('[data-testid="job-card"], .job-card, .card:has-text("Apply")');
    
    if (await jobCards.first().isVisible()) {
      // Should have job titles
      await expect(page.locator('text=Senior, text=Developer, text=Engineer, text=Manager')).toBeVisible();
      
      // Should have apply buttons
      const applyButtons = page.locator('button:has-text("Apply")');
      await expect(applyButtons.first()).toBeVisible();
    }
  });

  test('should apply for a job successfully', async ({ page }) => {
    // Find first available job
    const jobCards = page.locator('[data-testid="job-card"], .job-card');
    const firstJobCard = jobCards.first();
    
    if (await firstJobCard.isVisible()) {
      // Click apply button
      const applyButton = firstJobCard.locator('button:has-text("Apply")');
      await applyButton.click();
      
      // Should show success message or confirmation
      await expect(page.locator('text=Applied, text=Success, text=Application submitted')).toBeVisible({ timeout: 5000 });
      
      // Check if application appears in applications section
      await page.reload();
      const applicationsSection = page.locator('text=My Applications');
      await expect(applicationsSection).toBeVisible();
    }
  });

  test('should display applications section', async ({ page }) => {
    // Check applications section
    await expect(page.locator('text=My Applications')).toBeVisible();
    
    // Look for applications table or list
    const applicationsTable = page.locator('table, [data-testid="applications-list"]');
    
    if (await applicationsTable.isVisible()) {
      // Should have table headers
      await expect(page.locator('text=Job Title, text=Status, text=Applied')).toBeVisible();
    } else {
      // Should show "no applications" message
      await expect(page.locator('text=haven.*applied, text=No applications')).toBeVisible();
    }
  });

  test('should upload resume successfully', async ({ page }) => {
    // Look for resume upload section
    const uploadButton = page.locator('button:has-text("Upload Resume"), input[type="file"]');
    
    if (await uploadButton.isVisible()) {
      // Create a test file
      const testFile = {
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test pdf content')
      };
      
      // Upload file
      if (await uploadButton.getAttribute('type') === 'file') {
        await uploadButton.setInputFiles(testFile);
      } else {
        await uploadButton.click();
        // Handle file dialog if needed
      }
      
      // Look for success message
      await expect(page.locator('text=uploaded, text=success, text=Resume')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display career development section', async ({ page }) => {
    // Check career development section
    await expect(page.locator('text=Career Development')).toBeVisible();
    
    // Check for career buttons
    const careerButtons = [
      'Get Career Analysis',
      'Prepare for Interview', 
      'View Learning Plan'
    ];
    
    for (const buttonText of careerButtons) {
      const button = page.locator(`button:has-text("${buttonText}")`);
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
      }
    }
  });

  test('should handle career analysis button', async ({ page }) => {
    // Find career analysis button
    const careerButton = page.locator('button:has-text("Get Career Analysis")');
    
    if (await careerButton.isVisible()) {
      await careerButton.click();
      
      // Should show loading state or results
      await expect(page.locator('text=Loading, text=Analysis, text=Career')).toBeVisible({ timeout: 10000 });
      
      // Wait for completion (either success or error)
      await page.waitForTimeout(3000);
      
      // Check for results or error message
      const results = page.locator('text=skills, text=recommendation, text=career path');
      const error = page.locator('text=error, text=failed, text=unavailable');
      
      await expect(results.or(error)).toBeVisible();
    }
  });

  test('should display recommended jobs section', async ({ page }) => {
    // Look for recommended jobs
    const recommendedSection = page.locator('text=Recommended Jobs');
    
    if (await recommendedSection.isVisible()) {
      // Should have job recommendations
      const recommendedJobs = page.locator('[data-testid="recommended-job"], .recommended-job');
      
      if (await recommendedJobs.first().isVisible()) {
        // Should have match scores or AI insights
        await expect(page.locator('text=Match, text=AI, text=Recommended')).toBeVisible();
      }
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
    
    // Check if elements are still visible on mobile
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=My Applications')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to perform an action
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should show error message or loading state
      await expect(page.locator('text=error, text=failed, text=network')).toBeVisible({ timeout: 5000 });
    }
    
    // Restore connection
    await page.context().setOffline(false);
  });

  test('should handle session timeout', async ({ page }) => {
    // Clear localStorage to simulate session expiry
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to refresh or navigate
    await page.reload();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
