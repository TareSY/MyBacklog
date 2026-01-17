'use server';

import { signIn, signOut } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        });
    } catch (error) {
        // Handle error
        throw error;
    }
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/dashboard' });
}

export async function register(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const name = formData.get('name') as string || username;

    // Input validation
    if (!email || !password || !username) {
        throw new Error('Email, password, and username are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    // Password strength validation
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error('Password must contain uppercase, lowercase, and a number');
    }

    // Username validation
    const sanitizedUsername = username.trim().toLowerCase().slice(0, 30);
    if (!/^[a-z0-9_]+$/.test(sanitizedUsername)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters');
    }

    // Sanitize name
    const sanitizedName = String(name).trim().slice(0, 100) || sanitizedUsername;

    if (!isDatabaseConfigured()) {
        // Only allow mock registration in development
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Database not configured');
        }
        console.warn('Database not configured. Simulating registration.');
        redirect('/dashboard');
    }

    // Hash password with strong cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        // Create user
        await db.insert(users).values({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            username: sanitizedUsername,
            name: sanitizedName,
        });

        // Auto sign in after registration
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        });
    } catch (error) {
        throw new Error('Registration failed. Email or username may already exist.');
    }
}

export async function logout() {
    await signOut({ redirectTo: '/' });
}
