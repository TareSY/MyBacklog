'use server';

import { signIn, signOut } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users, lists } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// ============================================
// LOGIN
// ============================================
export async function login(formData: FormData): Promise<{ error?: string }> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('[AUTH:LOGIN] Attempt for email:', email?.slice(0, 3) + '***');

    if (!email || !password) {
        console.log('[AUTH:LOGIN] Missing credentials');
        return { error: 'Email and password are required' };
    }

    try {
        // signIn throws NEXT_REDIRECT on success, which is expected
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        });
        return {}; // Won't reach here on success due to redirect
    } catch (error: any) {
        // NEXT_REDIRECT is not an error - let it propagate
        if (error?.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }

        console.error('[AUTH:LOGIN] Error:', error?.message || error);

        // Handle CredentialsSignin error (wrong email/password)
        if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
            return { error: 'Invalid email or password' };
        }

        return { error: 'Login failed. Please try again.' };
    }
}

// ============================================
// GOOGLE LOGIN
// ============================================
export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/dashboard' });
}

// ============================================
// REGISTER
// ============================================
export async function register(formData: FormData): Promise<{ error?: string }> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const name = formData.get('name') as string || username;

    console.log('[AUTH:REGISTER] Attempt for username:', username);

    // ---- Input Validation ----
    if (!email || !password || !username) {
        console.log('[AUTH:REGISTER] Validation failed: missing fields');
        return { error: 'Email, password, and username are required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('[AUTH:REGISTER] Validation failed: invalid email format');
        return { error: 'Invalid email format' };
    }

    if (password.length < 6) {
        console.log('[AUTH:REGISTER] Validation failed: password too short');
        return { error: 'Password must be at least 6 characters' };
    }

    const sanitizedUsername = username.trim().toLowerCase().slice(0, 30);
    if (!/^[a-z0-9_]+$/.test(sanitizedUsername)) {
        console.log('[AUTH:REGISTER] Validation failed: invalid username chars:', username);
        return { error: 'Username can only contain letters, numbers, and underscores' };
    }
    if (sanitizedUsername.length < 3) {
        console.log('[AUTH:REGISTER] Validation failed: username too short');
        return { error: 'Username must be at least 3 characters' };
    }

    const sanitizedName = String(name).trim().slice(0, 100) || sanitizedUsername;

    // ---- Database Check ----
    if (!isDatabaseConfigured()) {
        console.error('[AUTH:REGISTER] Database not configured!');
        if (process.env.NODE_ENV === 'production') {
            return { error: 'Service temporarily unavailable' };
        }
        redirect('/dashboard');
    }

    // ---- Create User ----
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        console.log('[AUTH:REGISTER] Creating user in database...');

        const [newUser] = await db.insert(users).values({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            username: sanitizedUsername,
            name: sanitizedName,
        }).returning();

        console.log('[AUTH:REGISTER] User created with ID:', newUser.id);

        // Create default list
        await db.insert(lists).values({
            userId: newUser.id,
            name: 'My Backlog',
            description: 'My default collection',
            isPublic: false,
        });

        console.log('[AUTH:REGISTER] Default list created');

    } catch (error: any) {
        const errorMessage = error?.message || String(error);
        console.error('[AUTH:REGISTER] Database error:', errorMessage);

        if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('23505')) {
            if (errorMessage.toLowerCase().includes('email')) {
                return { error: 'An account with this email already exists. Please log in instead.' };
            }
            if (errorMessage.toLowerCase().includes('username')) {
                return { error: 'This username is already taken. Please choose another.' };
            }
            return { error: 'An account with this email or username already exists.' };
        }

        return { error: 'Registration failed. Please try again.' };
    }

    // ---- Auto Sign In ----
    console.log('[AUTH:REGISTER] Signing in new user...');

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        });
    } catch (error: any) {
        // NEXT_REDIRECT is expected - let it propagate
        if (error?.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('[AUTH:REGISTER] Sign-in after register failed:', error?.message);
    }

    return {}; // Success (usually won't reach due to redirect)
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
    console.log('[AUTH:LOGOUT] User logging out');
    await signOut({ redirectTo: '/' });
}
