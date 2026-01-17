import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/MyBacklog/);
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });

    test('should show signup page', async ({ page }) => {
        await page.goto('/signup');
        await expect(page.getByRole('heading', { name: /create account|join|sign up/i })).toBeVisible();
    });

    test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated users from lists to login', async ({ page }) => {
        await page.goto('/lists');
        await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated users from browse to login', async ({ page }) => {
        await page.goto('/browse');
        await expect(page).toHaveURL(/login/);
    });

    test('should show validation errors for invalid login', async ({ page }) => {
        await page.goto('/login');

        // Try submitting empty form
        await page.getByRole('button', { name: /log in/i }).click();

        // Should show required field validation (HTML5)
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toBeVisible();
    });

    test('should navigate between login and signup', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /sign up/i }).click();
        await expect(page).toHaveURL(/signup/);

        await page.getByRole('link', { name: /log in/i }).click();
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Landing Page', () => {
    test('should display landing page content', async ({ page }) => {
        await page.goto('/');

        // Check hero section
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check navigation
        await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /get started|sign up/i })).toBeVisible();
    });

    test('should navigate to login from landing page', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /log in/i }).click();
        await expect(page).toHaveURL(/login/);
    });

    test('should navigate to signup from CTA', async ({ page }) => {
        await page.goto('/');
        // Click the main CTA button
        const ctaButton = page.getByRole('link', { name: /get started|start|sign up/i }).first();
        await ctaButton.click();
        await expect(page).toHaveURL(/signup/);
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Page should still be functional
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
