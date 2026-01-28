import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { notifications, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const userId = session.user.id;
        const searchParams = request.nextUrl.searchParams;
        const unreadOnly = searchParams.get('unread') === 'true';
        const rawLimit = parseInt(searchParams.get('limit') || '20');
        const limit = Math.min(isNaN(rawLimit) ? 20 : rawLimit, 50);

        // Build query conditions
        const conditions = [eq(notifications.userId, userId)];
        if (unreadOnly) {
            conditions.push(eq(notifications.isRead, false));
        }

        // Get notifications with actor info
        const notifs = await db
            .select({
                id: notifications.id,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                link: notifications.link,
                isRead: notifications.isRead,
                createdAt: notifications.createdAt,
                actorName: users.name,
                actorUsername: users.username,
                actorImage: users.image,
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.actorId, users.id))
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);

        // Get unread count
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(notifications)
            .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

        return NextResponse.json({
            notifications: notifs,
            unreadCount: count,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const userId = session.user.id;
        const body = await request.json();
        const { ids, all } = body;

        if (all) {
            // Mark all as read
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, userId));
        } else if (ids && Array.isArray(ids) && ids.length > 0) {
            // Mark specific notifications as read - batch update
            const { inArray } = await import('drizzle-orm');
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(and(
                    inArray(notifications.id, ids),
                    eq(notifications.userId, userId)
                ));
        } else {
            return NextResponse.json({ error: 'Must provide ids or all=true' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
