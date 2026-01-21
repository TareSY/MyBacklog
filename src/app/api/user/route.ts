import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users, lists, items } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { name, username, image } = body;

        // Input validation
        const updates: Record<string, string> = {};

        if (name !== undefined) {
            // Sanitize and validate name
            const sanitizedName = String(name).trim().slice(0, 100);
            if (sanitizedName.length < 1) {
                return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
            }
            updates.name = sanitizedName;
        }

        if (username !== undefined) {
            // Sanitize and validate username
            const sanitizedUsername = String(username).trim().toLowerCase().slice(0, 30);

            // Username format: alphanumeric and underscores only
            if (!/^[a-z0-9_]+$/.test(sanitizedUsername)) {
                return NextResponse.json({
                    error: 'Username can only contain letters, numbers, and underscores'
                }, { status: 400 });
            }

            if (sanitizedUsername.length < 3) {
                return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
            }

            // Check if username is already taken
            const existing = await db
                .select()
                .from(users)
                .where(eq(users.username, sanitizedUsername))
                .limit(1);

            if (existing.length > 0 && existing[0].id !== session.user.id) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
            }
            updates.username = sanitizedUsername;
        }

        if (image !== undefined) {
            // Allow null to remove image
            updates.image = image;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        await db
            .update(users)
            .set(updates)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE /api/user - Delete user account
export async function DELETE(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        // Delete user (cascade will handle lists and items)
        await db
            .delete(users)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
