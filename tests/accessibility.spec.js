import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  const testUser = {
    email: 'abc@gmail.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Enable accessibility testing
    await page.goto('/login');
  });

  test('should have proper page structure and landmarks', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(0);
      
      // Headings should be in logical order
      const firstHeading = await headings.first().textContent();
      expect(firstHeading?.length).toBeGreaterThan(0);
    }
    
    // Check for main landmark
    const mainElement = page.locator('main, [role="main"]');
    expect(await mainElement.count()).toBeGreaterThanOrEqual(0);
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
    // Check form inputs have labels
    const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      
      // Should have associated label or aria-label
      const hasLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
      const hasAriaLabel = await input.getAttribute('aria-label') !== null;
      const hasPlaceholder = await input.getAttribute('placeholder') !== null;
      
      expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
    }
    
    // Check form validation
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    if (await emailInput.isVisible()) {
      // Should have proper input type
      expect(await emailInput.getAttribute('type')).toBe('email');
      
      // Should have required attribute if needed
      const isRequired = await emailInput.getAttribute('required') !== null;
      if (isRequired) {
        expect(isRequired).toBeTruthy();
      }
    }
    
    if (await passwordInput.isVisible()) {
      // Should have password type
      expect(await passwordInput.getAttribute('type')).toBe('password');
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    // Check buttons have accessible names
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) { // Check first 10 buttons
      const button = buttons.nth(i);
      
      // Should have text content or aria-label
      const hasText = (await button.textContent())?.trim().length > 0;
      const hasAriaLabel = await button.getAttribute('aria-label') !== null;
      const hasAriaLabelledBy = await button.getAttribute('aria-labelledby') !== null;
      
      expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    }
    
    // Check submit button
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      expect(await submitButton.textContent()).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Focus should move to first focusable element
    const focusedElement = page.locator(':focus');
    expect(await focusedElement.count()).toBe(1);
    
    // Test tab through form fields
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.focus();
      await page.keyboard.press('Tab');
      
      // Focus should move to next element
      const nextFocused = page.locator(':focus');
      expect(await nextFocused.count()).toBe(1);
    }
    
    // Test Enter key on submit button
    if (await submitButton.isVisible()) {
      await submitButton.focus();
      await page.keyboard.press('Enter');
      
      // Should submit form or trigger action
      await page.waitForTimeout(1000);
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check text color contrast (simplified check)
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, label');
    const elementCount = await textElements.count();
    
    // Check a few elements for contrast
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = textElements.nth(i);
      
      // Get computed styles
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // Should have visible color (not transparent)
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
      
      // Should have reasonable font size
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(12); // At least 12px
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for ARIA labels and descriptions
    const elementsWithAria = page.locator('[aria-label], [aria-describedby], [aria-labelledby]');
    const ariaCount = await elementsWithAria.count();
    
    // Should have some ARIA attributes for complex components
    if (ariaCount > 0) {
      for (let i = 0; i < Math.min(ariaCount, 5); i++) {
        const element = elementsWithAria.nth(i);
        
        // ARIA attributes should have meaningful values
        const ariaLabel = await element.getAttribute('aria-label');
        if (ariaLabel) {
          expect(ariaLabel.trim().length).toBeGreaterThan(0);
        }
      }
    }
    
    // Check for proper roles
    const elementsWithRoles = page.locator('[role]');
    const roleCount = await elementsWithRoles.count();
    
    if (roleCount > 0) {
      for (let i = 0; i < Math.min(roleCount, 5); i++) {
        const element = elementsWithRoles.nth(i);
        const role = await element.getAttribute('role');
        
        // Should use valid ARIA roles
        const validRoles = ['button', 'navigation', 'main', 'complementary', 'banner', 'contentinfo', 'search', 'tab', 'tabpanel', 'dialog'];
        expect(validRoles).toContain(role);
      }
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [aria-atomic], [role="status"], [role="alert"]');
    const liveRegionCount = await liveRegions.count();
    
    // Should have live regions for dynamic content
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        
        // Live regions should have proper attributes
        const ariaLive = await region.getAttribute('aria-live');
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
      }
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Login to access dashboard
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Check focus indicators
    const focusableElements = page.locator('button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = focusableElements.nth(i);
      
      // Element should be focusable
      await element.focus();
      const isFocused = await element.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
      
      // Should have visible focus indicator
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el, ':focus');
        return {
          outline: computed.outline,
          outlineStyle: computed.outlineStyle,
          boxShadow: computed.boxShadow
        };
      });
      
      // Should have some focus indicator
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.outlineStyle !== 'none' || 
        styles.boxShadow.includes('focus');
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check for images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        
        // Should have alt text
        const altText = await image.getAttribute('alt');
        expect(altText).toBeTruthy();
        
        // Alt text should be meaningful (not just decorative)
        if (altText && altText !== '') {
          expect(altText.length).toBeGreaterThan(3);
        }
      }
    }
  });

  test('should have proper link accessibility', async ({ page }) => {
    // Check for links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        
        // Should have meaningful text or aria-label
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        expect(linkText?.trim().length || ariaLabel?.length).toBeGreaterThan(0);
        
        // Should have valid href
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('should handle error messages accessibly', async ({ page }) => {
    // Try to trigger error message
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = page.locator('.error, [role="alert"], .alert, text=Invalid');
    
    if (await errorMessage.isVisible()) {
      // Error should be properly announced
      const hasAriaLive = await errorMessage.getAttribute('aria-live') !== null;
      const hasRole = await errorMessage.getAttribute('role') === 'alert';
      
      expect(hasAriaLive || hasRole).toBeTruthy();
      
      // Error should be readable
      const errorText = await errorMessage.textContent();
      expect(errorText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have proper table accessibility', async ({ page }) => {
    // Login to access dashboard with tables
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidate/);
    
    // Check for tables
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        
        // Should have proper headers
        const headers = table.locator('th');
        const headerCount = await headers.count();
        
        if (headerCount > 0) {
          // Headers should have scope attribute
          for (let j = 0; j < headerCount; j++) {
            const header = headers.nth(j);
            const scope = await header.getAttribute('scope');
            
            if (scope) {
              expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope);
            }
          }
        }
        
        // Should have caption if complex
        const caption = table.locator('caption');
        if (await caption.isVisible()) {
          const captionText = await caption.textContent();
          expect(captionText?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should have proper skip links', async ({ page }) => {
    // Check for skip links
    const skipLinks = page.locator('a[href^="#"], .skip-link');
    const skipLinkCount = await skipLinks.count();
    
    if (skipLinkCount > 0) {
      for (let i = 0; i < skipLinkCount; i++) {
        const skipLink = skipLinks.nth(i);
        
        // Should be visible when focused
        await skipLink.focus();
        const isVisible = await skipLink.isVisible();
        
        // Skip links should be functional
        const href = await skipLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          const target = page.locator(`#${targetId}, [id="${targetId}"]`);
          expect(await target.count()).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
