import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists, friendships, users, categories } from '@/lib/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/friends/[id]/compare - Compare backlogs with a friend
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

        // Verify friendship
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

        // Get friend info
        const [friend] = await db
            .select({ id: users.id, name: users.name, username: users.username })
            .from(users)
            .where(eq(users.id, friendId));

        // Get user's items
        const userLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.userId, userId));
        const userListIds = userLists.map(l => l.id);

        let userItems: any[] = [];
        if (userListIds.length > 0) {
            userItems = await db
                .select({
                    id: items.id,
                    title: items.title,
                    categoryId: items.categoryId,
                    isCompleted: items.isCompleted,
                    externalId: items.externalId,
                })
                .from(items)
                .where(inArray(items.listId, userListIds));
        }

        // Get friend's items (public lists only)
        const friendLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(and(eq(lists.userId, friendId), eq(lists.isPublic, true)));
        const friendListIds = friendLists.map(l => l.id);

        let friendItems: any[] = [];
        if (friendListIds.length > 0) {
            friendItems = await db
                .select({
                    id: items.id,
                    title: items.title,
                    categoryId: items.categoryId,
                    isCompleted: items.isCompleted,
                    externalId: items.externalId,
                })
                .from(items)
                .where(inArray(items.listId, friendListIds));
        }

        // Get categories for names
        const allCategories = await db.select().from(categories);
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));

        // Compare items
        const userTitles = new Set(userItems.map(i => i.title.toLowerCase()));
        const friendTitles = new Set(friendItems.map(i => i.title.toLowerCase()));

        const common = userItems.filter(i => friendTitles.has(i.title.toLowerCase()));
        const onlyUser = userItems.filter(i => !friendTitles.has(i.title.toLowerCase()));
        const onlyFriend = friendItems.filter(i => !userTitles.has(i.title.toLowerCase()));

        const addCategory = (items: any[]) => items.map(i => ({
            ...i,
            category: categoryMap[i.categoryId] || 'Unknown',
        }));

        return NextResponse.json({
            friend,
            stats: {
                yourTotal: userItems.length,
                friendTotal: friendItems.length,
                common: common.length,
                onlyYou: onlyUser.length,
                onlyFriend: onlyFriend.length,
            },
            common: addCategory(common.slice(0, 20)),
            onlyYou: addCategory(onlyUser.slice(0, 20)),
            onlyFriend: addCategory(onlyFriend.slice(0, 20)),
        });
    } catch (error) {
        console.error('Error comparing backlogs:', error);
        return NextResponse.json({ error: 'Failed to compare' }, { status: 500 });
    }
}
