import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  const testUsers = {
    candidate: {
      email: 'abc@gmail.com',
      password: 'password123',
      role: 'candidate'
    },
    company: {
      email: 'xyz@gmail.com', 
      password: 'password123',
      role: 'company'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title and main elements
    await expect(page).toHaveTitle(/AI Resume Ranking/);
    await expect(page.locator('h1, h2')).toContainText('Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Register')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to login with empty fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should login successfully as candidate', async ({ page }) => {
    // Login as candidate
    await page.fill('input[name="email"]', testUsers.candidate.email);
    await page.fill('input[name="password"]', testUsers.candidate.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to candidate dashboard
    await expect(page).toHaveURL(/\/candidate/);
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=My Applications')).toBeVisible();
    await expect(page.locator('text=Career Development')).toBeVisible();
  });

  test('should login successfully as company', async ({ page }) => {
    // Login as company
    await page.fill('input[name="email"]', testUsers.company.email);
    await page.fill('input[name="password"]', testUsers.company.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to company dashboard
    await expect(page).toHaveURL(/\/company/);
    await expect(page.locator('h1, h2')).toContainText('Company Dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('text=Company Profile')).toBeVisible();
    await expect(page.locator('text=Job Postings')).toBeVisible();
    await expect(page.locator('text=Applicants')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click register link
    await page.click('text=Register');
    
    // Should navigate to registration page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h1, h2')).toContainText('Register');
    
    // Check registration form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register new candidate successfully', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Register');
    
    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `newcandidate${timestamp}@test.com`);
    await page.fill('input[name="password"]', 'newpassword123');
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');
    
    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(login|candidate)/);
    
    // If redirected to login, try to login
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', `newcandidate${timestamp}@test.com`);
      await page.fill('input[name="password"]', 'newpassword123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/candidate/);
    }
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', testUsers.candidate.email);
    await page.fill('input[name="password"]', testUsers.candidate.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/candidate/);
    
    // Look for logout button/link
    const logoutButton = page.locator('button:has-text("Logout"), text=Logout, [data-testid="logout"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should prevent access to protected routes when not logged in', async ({ page }) => {
    // Try to access candidate dashboard without login
    await page.goto('/candidate');
    await expect(page).toHaveURL(/\/login/);
    
    // Try to access company dashboard without login
    await page.goto('/company');
    await expect(page).toHaveURL(/\/login/);
  });
});
