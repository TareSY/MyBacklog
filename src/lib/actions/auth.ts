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

    if (!isDatabaseConfigured()) {
        // Mock registration for development
        console.warn('Database not configured. Simulating registration.');
        redirect('/dashboard');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Create user
        await db.insert(users).values({
            email,
            password: hashedPassword,
            username,
            name,
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
