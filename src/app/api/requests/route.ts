import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { itemRequests } from '@/lib/db/schema';

// POST /api/requests - Submit a new item request
export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !db) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { title, category, year, notes } = body;

        // Validation
        if (!title || typeof title !== 'string' || title.trim().length < 2) {
            return NextResponse.json({ error: 'Title is required (min 2 characters)' }, { status: 400 });
        }

        const validCategories = ['movies', 'tv', 'books', 'music', 'games'];
        if (!category || !validCategories.includes(category)) {
            return NextResponse.json({ error: 'Valid category is required' }, { status: 400 });
        }

        if (notes && notes.length > 500) {
            return NextResponse.json({ error: 'Notes must be under 500 characters' }, { status: 400 });
        }

        // Insert into database
        await db.insert(itemRequests).values({
            userId: session.user.id,
            userEmail: session.user.email,
            title: title.trim(),
            category,
            year: year?.trim() || null,
            notes: notes?.trim() || null,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            message: 'Request submitted! We\'ll review it soon.'
        });

    } catch (error) {
        console.error('[REQUESTS] Error saving request:', error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}

// GET /api/requests - Get all requests (admin only, or user's own)
export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !db) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        // For now, just return all pending requests (can add admin check later)
        const requests = await db.query.itemRequests.findMany({
            orderBy: (itemRequests, { desc }) => [desc(itemRequests.createdAt)],
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('[REQUESTS] Error fetching requests:', error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
