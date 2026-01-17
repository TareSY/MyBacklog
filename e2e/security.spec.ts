import { test, expect } from '@playwright/test';

test.describe('Compare Backlog Feature', () => {
    test('compare API returns 401 when not authenticated', async ({ request }) => {
        const response = await request.get('/api/friends/test-id/compare');
        expect(response.status()).toBe(401);
    });

    test('compare page redirects unauthenticated user', async ({ page }) => {
        await page.goto('/friends/test-id/compare');
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Activity Feed Feature', () => {
    test('activity API returns 401 when not authenticated', async ({ request }) => {
        const response = await request.get('/api/activity');
        expect(response.status()).toBe(401);
    });

    test('activity page redirects unauthenticated user', async ({ page }) => {
        await page.goto('/activity');
        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Security Tests', () => {
    test('protected routes redirect to login', async ({ page }) => {
        const protectedRoutes = [
            '/dashboard',
            '/lists',
            '/browse',
            '/settings',
            '/friends',
            '/activity',
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);
            await expect(page).toHaveURL(/login/, { timeout: 5000 });
        }
    });

    test('API endpoints require authentication', async ({ request }) => {
        const protectedEndpoints = [
            { method: 'GET', url: '/api/lists' },
            { method: 'GET', url: '/api/items' },
            { method: 'GET', url: '/api/friends' },
            { method: 'GET', url: '/api/activity' },
            { method: 'GET', url: '/api/user' },
        ];

        for (const endpoint of protectedEndpoints) {
            const response = await request[endpoint.method.toLowerCase() as 'get'](endpoint.url);
            expect(response.status()).toBe(401);
        }
    });

    test('POST endpoints reject unauthenticated requests', async ({ request }) => {
        const response = await request.post('/api/friends', {
            data: { username: 'malicious' }
        });
        expect(response.status()).toBe(401);
    });

    test('PUT endpoints reject unauthenticated requests', async ({ request }) => {
        const response = await request.put('/api/user', {
            data: { name: 'Hacker' }
        });
        expect(response.status()).toBe(401);
    });

    test('DELETE endpoints reject unauthenticated requests', async ({ request }) => {
        const response = await request.delete('/api/user');
        expect(response.status()).toBe(401);
    });
});

test.describe('Public Routes', () => {
    test('landing page is accessible', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/MyBacklog/);
    });

    test('login page is accessible', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    });

    test('signup page is accessible', async ({ page }) => {
        await page.goto('/signup');
        await expect(page).toHaveURL(/signup/);
    });

    test('offline page is accessible', async ({ page }) => {
        await page.goto('/offline');
        await expect(page.getByText(/offline/i)).toBeVisible();
    });
});
