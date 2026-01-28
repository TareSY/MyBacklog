import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users, lists, items, categories } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ username: string }>;
}

// GET /api/users/[username] - Get public user profile
export async function GET(request: NextRequest, { params }: RouteParams) {
    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { username } = await params;

        // Get user (public info only)
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                image: users.image,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.username, username.toLowerCase()))
            .limit(1);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's public lists with item counts
        const publicLists = await db
            .select({
                id: lists.id,
                name: lists.name,
                description: lists.description,
                createdAt: lists.createdAt,
            })
            .from(lists)
            .where(and(eq(lists.userId, user.id), eq(lists.isPublic, true)));

        // Get category stats for user's public items
        const categoryStats = await db
            .select({
                categoryId: items.categoryId,
                categoryName: categories.name,
                count: sql<number>`count(*)::int`,
            })
            .from(items)
            .innerJoin(lists, eq(items.listId, lists.id))
            .innerJoin(categories, eq(items.categoryId, categories.id))
            .where(and(eq(lists.userId, user.id), eq(lists.isPublic, true)))
            .groupBy(items.categoryId, categories.name);

        // Calculate total items
        const totalItems = categoryStats.reduce((sum, cat) => sum + cat.count, 0);

        return NextResponse.json({
            user: {
                ...user,
                // Don't expose internal ID publicly
                id: undefined,
            },
            stats: {
                totalItems,
                publicLists: publicLists.length,
                categories: categoryStats,
            },
            lists: publicLists.map(list => ({
                ...list,
                // Generate share URL
                url: `/share/${list.id}`,
            })),
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
