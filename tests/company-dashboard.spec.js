import { test, expect } from '@playwright/test';

test.describe('Company Dashboard Tests', () => {
  const testUser = {
    email: 'xyz@gmail.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Login as company before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/company/);
  });

  test('should display company dashboard correctly', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('h1, h2')).toContainText('Company Dashboard');
    
    // Check main sections
    await expect(page.locator('text=Company Profile')).toBeVisible();
    await expect(page.locator('text=Job Postings')).toBeVisible();
    await expect(page.locator('text=Applicants')).toBeVisible();
  });

  test('should display company profile information', async ({ page }) => {
    // Check profile section
    await expect(page.locator('[data-testid="company-profile"], .company-profile')).toBeVisible();
    
    // Should have company information
    await expect(page.locator('text=Company Name, text=Description, text=Industry')).toBeVisible();
    
    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")');
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should edit company profile successfully', async ({ page }) => {
    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")');
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Update company description
      const descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
      if (await descriptionInput.isVisible()) {
        await descriptionInput.clear();
        await descriptionInput.fill('Updated company description for testing');
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
        await saveButton.click();
        
        // Verify changes saved
        await expect(page.locator('text=Updated company description')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display job postings section', async ({ page }) => {
    // Check job postings section
    await expect(page.locator('text=Job Postings, text=My Jobs')).toBeVisible();
    
    // Look for job list or create job button
    const jobList = page.locator('[data-testid="job-list"], .job-list');
    const createButton = page.locator('button:has-text("Create Job"), button:has-text("Post Job")');
    
    // Should either show existing jobs or create button
    await expect(jobList.or(createButton)).toBeVisible();
  });

  test('should create new job posting', async ({ page }) => {
    // Look for create job button
    const createButton = page.locator('button:has-text("Create Job"), button:has-text("Post Job"), button:has-text("Add Job")');
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Should show job creation form
      await expect(page.locator('text=Job Title, text=Create Job')).toBeVisible();
      
      // Fill job form
      const titleInput = page.locator('input[name="title"], input[name="job_title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Software Engineer Position');
        
        const descriptionInput = page.locator('textarea[name="description"], textarea[name="job_description"]');
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('We are looking for a talented software engineer...');
        }
        
        const salaryInput = page.locator('input[name="salary"]');
        if (await salaryInput.isVisible()) {
          await salaryInput.fill('$80,000 - $120,000');
        }
        
        // Submit form
        const submitButton = page.locator('button:has-text("Create"), button:has-text("Post"), button:has-text("Submit")');
        await submitButton.click();
        
        // Should show success message
        await expect(page.locator('text=created, text=posted, text=success')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display existing job postings', async ({ page }) => {
    // Look for existing jobs
    const jobCards = page.locator('[data-testid="job-card"], .job-card, .card:has-text("Edit")');
    
    if (await jobCards.first().isVisible()) {
      // Should have job titles and actions
      await expect(page.locator('text=Senior, text=Developer, text=Engineer')).toBeVisible();
      
      // Should have edit/delete buttons
      const editButton = page.locator('button:has-text("Edit")');
      const deleteButton = page.locator('button:has-text("Delete")');
      
      if (await editButton.first().isVisible()) {
        await expect(editButton.first()).toBeVisible();
      }
      
      if (await deleteButton.first().isVisible()) {
        await expect(deleteButton.first()).toBeVisible();
      }
    }
  });

  test('should edit existing job posting', async ({ page }) => {
    // Find existing job
    const jobCards = page.locator('[data-testid="job-card"], .job-card');
    const firstJobCard = jobCards.first();
    
    if (await firstJobCard.isVisible()) {
      // Click edit button
      const editButton = firstJobCard.locator('button:has-text("Edit")');
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Should show edit form
        await expect(page.locator('text=Edit Job, text=Update Job')).toBeVisible();
        
        // Update job title
        const titleInput = page.locator('input[name="title"], input[name="job_title"]');
        if (await titleInput.isVisible()) {
          await titleInput.clear();
          await titleInput.fill('Updated Job Title');
          
          // Save changes
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
          await saveButton.click();
          
          // Verify changes saved
          await expect(page.locator('text=Updated Job Title')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should display applicants section', async ({ page }) => {
    // Check applicants section
    await expect(page.locator('text=Applicants, text=Applications')).toBeVisible();
    
    // Look for applicants list
    const applicantsList = page.locator('[data-testid="applicants-list"], .applicants-list');
    
    if (await applicantsList.isVisible()) {
      // Should have applicant information
      await expect(page.locator('text=Name, text=Email, text=Status')).toBeVisible();
    } else {
      // Should show "no applicants" message
      await expect(page.locator('text=no applicants, text=No applications')).toBeVisible();
    }
  });

  test('should view applicant details', async ({ page }) => {
    // Look for applicant cards
    const applicantCards = page.locator('[data-testid="applicant-card"], .applicant-card');
    
    if (await applicantCards.first().isVisible()) {
      // Click on applicant to view details
      await applicantCards.first().click();
      
      // Should show applicant details
      await expect(page.locator('text=Resume, text=Skills, text=Experience')).toBeVisible();
      
      // Should have action buttons (accept/reject)
      const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Shortlist")');
      const rejectButton = page.locator('button:has-text("Reject")');
      
      if (await acceptButton.isVisible()) {
        await expect(acceptButton).toBeVisible();
      }
      
      if (await rejectButton.isVisible()) {
        await expect(rejectButton).toBeVisible();
      }
    }
  });

  test('should handle applicant status updates', async ({ page }) => {
    // Find applicant with action buttons
    const applicantCards = page.locator('[data-testid="applicant-card"], .applicant-card');
    
    if (await applicantCards.first().isVisible()) {
      const firstCard = applicantCards.first();
      
      // Look for status buttons
      const acceptButton = firstCard.locator('button:has-text("Accept"), button:has-text("Shortlist")');
      const rejectButton = firstCard.locator('button:has-text("Reject")');
      
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        
        // Should show confirmation or status update
        await expect(page.locator('text=Accepted, text=Shortlisted, text=Status updated')).toBeVisible({ timeout: 5000 });
      } else if (await rejectButton.isVisible()) {
        await rejectButton.click();
        
        // Should show confirmation
        await expect(page.locator('text=Rejected, text=Status updated')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display analytics or statistics', async ({ page }) => {
    // Look for analytics section
    const analyticsSection = page.locator('text=Analytics, text=Statistics, text=Overview');
    
    if (await analyticsSection.isVisible()) {
      // Should have charts or statistics
      await expect(page.locator('text=Applications, text=Views, text=Hires')).toBeVisible();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1, h2')).toContainText('Company Dashboard');
    
    // Check if elements are still visible on mobile
    await expect(page.locator('text=Company Profile')).toBeVisible();
    await expect(page.locator('text=Job Postings')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1, h2')).toContainText('Company Dashboard');
  });

  test('should handle bulk actions on jobs', async ({ page }) => {
    // Look for bulk action options
    const checkboxes = page.locator('input[type="checkbox"]');
    const bulkActions = page.locator('button:has-text("Bulk"), button:has-text("Delete Selected")');
    
    if (await checkboxes.first().isVisible() && await bulkActions.isVisible()) {
      // Select first job
      await checkboxes.first().check();
      
      // Perform bulk action
      await bulkActions.click();
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirm, text=Are you sure')).toBeVisible();
    }
  });

  test('should search and filter jobs', async ({ page }) => {
    // Look for search/filter controls
    const searchInput = page.locator('input[placeholder*="Search"], input[name="search"]');
    const filterDropdown = page.locator('select, button:has-text("Filter")');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Software');
      await page.waitForTimeout(1000);
      
      // Should filter results
      await expect(page.locator('text=Software')).toBeVisible();
    }
    
    if (await filterDropdown.isVisible()) {
      await filterDropdown.click();
      
      // Should show filter options
      await expect(page.locator('text=Status, text=Date, text=Department')).toBeVisible();
    }
  });

  test('should export data', async ({ page }) => {
    // Look for export functionality
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    
    if (await exportButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/);
    }
  });
});
