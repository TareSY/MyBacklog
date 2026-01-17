import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { activities, users, friendships } from '@/lib/db/schema';
import { eq, or, and, desc, inArray } from 'drizzle-orm';

// GET /api/activity - Get activity feed for user and friends
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

        // Get friend IDs
        const friendshipRecords = await db
            .select()
            .from(friendships)
            .where(
                and(
                    or(
                        eq(friendships.requesterId, userId),
                        eq(friendships.addresseeId, userId)
                    ),
                    eq(friendships.status, 'accepted')
                )
            );

        const friendIds = friendshipRecords.map(f =>
            f.requesterId === userId ? f.addresseeId : f.requesterId
        );

        // Include user + friends
        const userIds = [userId, ...friendIds];

        // Get recent activities
        const recentActivities = await db
            .select({
                id: activities.id,
                userId: activities.userId,
                action: activities.action,
                targetType: activities.targetType,
                targetId: activities.targetId,
                targetTitle: activities.targetTitle,
                metadata: activities.metadata,
                createdAt: activities.createdAt,
            })
            .from(activities)
            .where(inArray(activities.userId, userIds))
            .orderBy(desc(activities.createdAt))
            .limit(50);

        // Get user details
        const activityUserIds = [...new Set(recentActivities.map(a => a.userId))];
        let activityUsers: any[] = [];
        if (activityUserIds.length > 0) {
            activityUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    image: users.image,
                })
                .from(users)
                .where(inArray(users.id, activityUserIds));
        }

        const userMap = Object.fromEntries(activityUsers.map(u => [u.id, u]));

        // Format activities
        const formattedActivities = recentActivities.map(a => ({
            ...a,
            user: userMap[a.userId],
            isCurrentUser: a.userId === userId,
        }));

        return NextResponse.json({ activities: formattedActivities });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}

// POST /api/activity - Log an activity (internal use)
export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { action, targetType, targetId, targetTitle, metadata } = body;

        const [activity] = await db.insert(activities).values({
            userId: session.user.id,
            action,
            targetType,
            targetId,
            targetTitle,
            metadata: metadata ? JSON.stringify(metadata) : null,
        }).returning();

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error('Error logging activity:', error);
        return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }
}
