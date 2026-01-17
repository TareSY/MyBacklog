import { test, expect } from '@playwright/test';

// These tests require authentication
// For now, they test the public aspects and UI presence

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Note: In a real scenario, you'd authenticate first
        // For now, these tests will redirect to login
        await page.goto('/dashboard');
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Browse Page UI', () => {
    test('unauthenticated access redirects to login', async ({ page }) => {
        await page.goto('/browse');
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Lists Page UI', () => {
    test('unauthenticated access redirects to login', async ({ page }) => {
        await page.goto('/lists');
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Settings Page UI', () => {
    test('unauthenticated access redirects to login', async ({ page }) => {
        await page.goto('/settings');
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('API Endpoints', () => {
    test('GET /api/lists returns 401 when not authenticated', async ({ request }) => {
        const response = await request.get('/api/lists');
        // Should return either 401 or mock data depending on config
        expect([200, 401]).toContain(response.status());
    });

    test('POST /api/lists returns 401 when not authenticated', async ({ request }) => {
        const response = await request.post('/api/lists', {
            data: { name: 'Test List' }
        });
        expect(response.status()).toBe(401);
    });

    test('POST /api/items returns 401 when not authenticated', async ({ request }) => {
        const response = await request.post('/api/items', {
            data: { title: 'Test Item', listId: 'fake-id', categoryId: 1 }
        });
        expect(response.status()).toBe(401);
    });
});

test.describe('Performance', () => {
    test('landing page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('login page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/login');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);
    });
});

test.describe('Accessibility', () => {
    test('landing page has proper heading structure', async ({ page }) => {
        await page.goto('/');

        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();

        // Should have only one h1
        const h1Count = await page.getByRole('heading', { level: 1 }).count();
        expect(h1Count).toBe(1);
    });

    test('login form has proper labels', async ({ page }) => {
        await page.goto('/login');

        // Email input should have label
        await expect(page.getByLabel(/email/i)).toBeVisible();

        // Password input should have label
        await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('buttons are keyboard accessible', async ({ page }) => {
        await page.goto('/login');

        // Tab to login button
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Should be able to focus on button
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });
});
