import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  const testUser = {
    email: 'abc@gmail.com',
    password: 'password123'
  };

  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check key elements are loaded
    await expect(page.locator('h1, h2')).toContainText('Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should login and load dashboard quickly', async ({ page }) => {
    // Start timing from login page
    await page.goto('/login');
    
    const startTime = Date.now();
    
    // Perform login
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL(/\/candidate/);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should complete within 5 seconds (including API calls)
    expect(loadTime).toBeLessThan(5000);
    
    // Dashboard should be fully loaded
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
  });

  test('should handle API responses quickly', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Monitor API calls
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });
    
    // Trigger API calls by refreshing
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const totalTime = Date.now() - startTime;
    
    // Should complete within 4 seconds
    expect(totalTime).toBeLessThan(4000);
    
    // Check API response times
    const apiResponseTimes = apiCalls.map(call => call.timestamp - startTime);
    const avgApiResponseTime = apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length;
    
    // Average API response should be under 1 second
    expect(avgApiResponseTime).toBeLessThan(1000);
  });

  test('should handle large job lists efficiently', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Measure job list loading time
    const startTime = Date.now();
    
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"], .job-card, .card:has-text("Apply")', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check if virtualization is working (if implemented)
    const jobCards = page.locator('[data-testid="job-card"], .job-card');
    const count = await jobCards.count();
    
    if (count > 20) {
      // If many jobs, should use virtualization
      const visibleJobs = await jobCards.filter({ has: page.locator(':visible') }).count();
      expect(visibleJobs).toBeLessThanOrEqual(20); // Should only render visible items
    }
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/candidate');
      await page.waitForLoadState('networkidle');
      
      // Check memory usage (simplified check)
      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryUsage) {
        // Memory usage should not grow excessively
        const memoryMB = memoryUsage.used / 1024 / 1024;
        expect(memoryMB).toBeLessThan(100); // Should be under 100MB
      }
    }
  });

  test('should handle network interruptions gracefully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Simulate network interruption
    await page.context().setOffline(true);
    
    // Try to perform an action
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should handle offline state gracefully
      await expect(page.locator('text=error, text=failed, text=network')).toBeVisible({ timeout: 3000 });
    }
    
    // Restore connection
    await page.context().setOffline(false);
    
    // Should recover when connection is restored
    await page.reload();
    await expect(page.locator('h1, h2')).toContainText('Candidate Dashboard');
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/**', async (route) => {
      // Add delay to API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Should show loading states during slow network
    await expect(page.locator('[data-testid="loading"], .loading, text=Loading')).toBeVisible({ timeout: 2000 });
    
    // Should eventually load despite slow network
    await expect(page).toHaveURL(/\/candidate/, { timeout: 10000 });
  });

  test('should optimize image and asset loading', async ({ page }) => {
    // Monitor resource loading
    const resources = [];
    page.on('response', response => {
      resources.push({
        url: response.url(),
        type: response.request().resourceType(),
        size: response.headers()['content-length'] || 0
      });
    });
    
    // Load login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for optimized images
    const images = resources.filter(r => r.type === 'image');
    images.forEach(image => {
      // Images should be reasonably sized
      if (image.size > 0) {
        expect(image.size).toBeLessThan(1024 * 1024); // Under 1MB per image
      }
    });
    
    // Check for compressed assets
    const scripts = resources.filter(r => r.type === 'script');
    scripts.forEach(script => {
      // Scripts should be compressed
      const isCompressed = script.url.includes('.min.') || script.url.includes('.bundle.');
      expect(isCompressed).toBeTruthy();
    });
  });

  test('should handle concurrent requests efficiently', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Track concurrent requests
    const concurrentRequests = [];
    let activeRequests = 0;
    
    page.on('request', () => {
      activeRequests++;
      concurrentRequests.push(activeRequests);
    });
    
    page.on('response', () => {
      activeRequests--;
    });
    
    // Trigger multiple concurrent requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should handle concurrent requests efficiently
    const maxConcurrent = Math.max(...concurrentRequests);
    expect(maxConcurrent).toBeLessThan(10); // Should not overwhelm the server
  });

  test('should maintain performance under load', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Perform multiple actions rapidly
    const actions = [];
    for (let i = 0; i < 10; i++) {
      actions.push(
        page.goto('/candidate'),
        page.reload(),
        page.click('button:has-text("Edit")'),
        page.click('button:has-text("Cancel")')
      );
    }
    
    const startTime = Date.now();
    await Promise.all(actions);
    const totalTime = Date.now() - startTime;
    
    // Should handle multiple actions efficiently
    expect(totalTime).toBeLessThan(15000); // Under 15 seconds for 40 actions
  });

  test('should optimize database queries', async ({ page }) => {
    // Monitor API response times for database operations
    const apiMetrics = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.request().timing();
        apiMetrics.push({
          url: response.url(),
          responseTime: timing.responseEnd - timing.requestStart,
          status: response.status()
        });
      }
    });
    
    // Login and load dashboard
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    await page.waitForLoadState('networkidle');
    
    // Check database query performance
    const dbQueries = apiMetrics.filter(m => 
      m.url.includes('/candidate/me') || 
      m.url.includes('/candidate/jobs') || 
      m.url.includes('/candidate/applications')
    );
    
    dbQueries.forEach(query => {
      // Database queries should be fast
      expect(query.responseTime).toBeLessThan(500); // Under 500ms
    });
  });
});
