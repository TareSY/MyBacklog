import { test, expect } from '@playwright/test';

test.describe('Friends Feature', () => {
    test('should redirect unauthenticated user from friends page', async ({ page }) => {
        await page.goto('/friends');
        await expect(page).toHaveURL(/login/);
    });

    test('friends API returns 401 when not authenticated', async ({ request }) => {
        const response = await request.get('/api/friends');
        expect(response.status()).toBe(401);
    });

    test('send friend request returns 401 when not authenticated', async ({ request }) => {
        const response = await request.post('/api/friends', {
            data: { username: 'testuser' }
        });
        expect(response.status()).toBe(401);
    });
});

test.describe('Public List Sharing', () => {
    test('share page 404s for non-existent list', async ({ page }) => {
        await page.goto('/share/non-existent-slug');
        await expect(page).toHaveTitle(/404|Not Found/i);
    });
});

test.describe('PWA Features', () => {
    test('manifest.json is accessible', async ({ request }) => {
        const response = await request.get('/manifest.json');
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest.name).toBe('MyBacklog');
        expect(manifest.short_name).toBe('MyBacklog');
        expect(manifest.display).toBe('standalone');
    });

    test('service worker is registered', async ({ request }) => {
        const response = await request.get('/sw.js');
        expect(response.status()).toBe(200);
    });

    test('offline page exists', async ({ page }) => {
        await page.goto('/offline');
        await expect(page.getByText(/offline/i)).toBeVisible();
    });
});
