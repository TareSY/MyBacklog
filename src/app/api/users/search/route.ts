import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ilike, ne, and } from 'drizzle-orm';

// GET /api/users/search?q=username
export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    try {
        // Sanitize query - only allow alphanumeric and underscores
        const sanitizedQuery = query.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

        if (sanitizedQuery.length < 2) {
            return NextResponse.json({ users: [] });
        }

        // Search for users by username (case-insensitive)
        // Exclude current user from results
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                image: users.image,
            })
            .from(users)
            .where(
                and(
                    ilike(users.username, `%${sanitizedQuery}%`),
                    ne(users.id, session.user.id)
                )
            )
            .limit(10);

        // Never return sensitive fields (password, email)
        return NextResponse.json({ users: results });
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }
}
