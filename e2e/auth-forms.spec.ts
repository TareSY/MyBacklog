import { test, expect } from '@playwright/test';

test.describe('Account Creation E2E', () => {
    test('signup page loads correctly', async ({ page }) => {
        await page.goto('/signup');

        // Verify form elements exist
        await expect(page.getByLabel(/username/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('signup shows error for invalid email format', async ({ page }) => {
        await page.goto('/signup');

        await page.getByLabel(/username/i).fill('validuser');
        await page.getByLabel(/email/i).fill('invalid-email');
        await page.getByLabel(/password/i).fill('ValidPass123');

        await page.getByRole('button', { name: /create account/i }).click();

        // Wait for server response
        await expect(page.getByText(/Invalid email format/i)).toBeVisible({ timeout: 15000 });
    });

    test('signup shows error for short password', async ({ page }) => {
        await page.goto('/signup');

        await page.getByLabel(/username/i).fill('validuser');
        await page.getByLabel(/email/i).fill('valid@email.com');
        await page.getByLabel(/password/i).fill('12345'); // 5 chars (too short)

        await page.getByRole('button', { name: /create account/i }).click();

        // Wait for server response
        await expect(page.getByText(/at least 6 characters/i)).toBeVisible({ timeout: 15000 });
    });

    test('signup shows error for invalid username', async ({ page }) => {
        await page.goto('/signup');

        await page.getByLabel(/username/i).fill('ab'); // Too short
        await page.getByLabel(/email/i).fill('valid@email.com');
        await page.getByLabel(/password/i).fill('validpassword');

        await page.getByRole('button', { name: /create account/i }).click();

        // Wait for server response
        await expect(page.getByText(/Username must be at least 3 characters/i)).toBeVisible({ timeout: 15000 });
    });

    test('login page shows error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('nonexistent@example.com');
        await page.getByLabel(/password/i).fill('wrongpassword');

        await page.getByRole('button', { name: /log in|sign in/i }).click();

        // Should stay on login page or show error
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Form Validation Tests', () => {
    test('required fields show validation', async ({ page }) => {
        await page.goto('/signup');

        // Try submitting empty form
        await page.getByRole('button', { name: /create account/i }).click();

        // HTML5 validation should prevent submission
        const usernameInput = page.getByLabel(/username/i);
        const isInvalid = await usernameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBe(true);
    });
});
