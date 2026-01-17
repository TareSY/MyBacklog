import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { lists, items, users, friendships, categories } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/friends/[id]/lists - Get a friend's public lists
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { id: friendId } = await params;
        const userId = session.user.id;

        // Verify friendship exists and is accepted
        const friendship = await db
            .select()
            .from(friendships)
            .where(
                and(
                    or(
                        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
                        and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId))
                    ),
                    eq(friendships.status, 'accepted')
                )
            )
            .limit(1);

        if (friendship.length === 0) {
            return NextResponse.json({ error: 'Not friends' }, { status: 403 });
        }

        // Get friend's info
        const friend = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, friendId))
            .limit(1);

        if (friend.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get friend's public lists with item counts
        const friendLists = await db
            .select({
                id: lists.id,
                name: lists.name,
                description: lists.description,
                isPublic: lists.isPublic,
                shareSlug: lists.shareSlug,
                createdAt: lists.createdAt,
            })
            .from(lists)
            .where(and(eq(lists.userId, friendId), eq(lists.isPublic, true)));

        // Get item counts for each list
        const listsWithCounts = await Promise.all(
            friendLists.map(async (list) => {
                const listItems = await db
                    .select({ id: items.id, isCompleted: items.isCompleted })
                    .from(items)
                    .where(eq(items.listId, list.id));

                return {
                    ...list,
                    itemCount: listItems.length,
                    completedCount: listItems.filter(i => i.isCompleted).length,
                };
            })
        );

        return NextResponse.json({
            friend: friend[0],
            lists: listsWithCounts,
        });
    } catch (error) {
        console.error('Error fetching friend lists:', error);
        return NextResponse.json({ error: 'Failed to fetch friend lists' }, { status: 500 });
    }
}
