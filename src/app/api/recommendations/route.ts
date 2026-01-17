import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists, categories } from '@/lib/db/schema';
import { eq, desc, inArray, not, sql } from 'drizzle-orm';

// GET /api/recommendations - Get personalized recommendations
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

        // Get user's lists and items
        const userLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.userId, userId));
        const userListIds = userLists.map(l => l.id);

        let userItemTitles: string[] = [];
        let userCategories: string[] = [];

        if (userListIds.length > 0) {
            const userItems = await db
                .select({
                    title: items.title,
                    categoryId: items.categoryId,
                })
                .from(items)
                .where(inArray(items.listId, userListIds));

            userItemTitles = userItems.map(i => i.title.toLowerCase());
            userCategories = [...new Set(userItems.map(i => i.categoryId))];
        }

        // Get all categories
        const allCategories = await db.select().from(categories);
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]));

        // Get public lists (Featured lists)
        const publicLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(eq(lists.isPublic, true));

        const publicListIds = publicLists.map(l => l.id);

        if (publicListIds.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        // Strategy 1: Items from same categories user is interested in
        let categoryRecs: any[] = [];
        if (userCategories.length > 0) {
            const catItems = await db
                .select({
                    id: items.id,
                    title: items.title,
                    subtitle: items.subtitle,
                    imageUrl: items.imageUrl,
                    releaseYear: items.releaseYear,
                    categoryId: items.categoryId,
                })
                .from(items)
                .where(inArray(items.listId, publicListIds))
                .orderBy(sql`RANDOM()`)
                .limit(30);

            categoryRecs = catItems
                .filter(i =>
                    userCategories.includes(i.categoryId) &&
                    !userItemTitles.includes(i.title.toLowerCase())
                )
                .slice(0, 10);
        }

        // Strategy 2: Popular items (random from public lists)
        const popularItems = await db
            .select({
                id: items.id,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                categoryId: items.categoryId,
            })
            .from(items)
            .where(inArray(items.listId, publicListIds))
            .orderBy(sql`RANDOM()`)
            .limit(20);

        const popularRecs = popularItems
            .filter(i => !userItemTitles.includes(i.title.toLowerCase()))
            .slice(0, 10);

        // Combine and deduplicate
        const allRecs = [...categoryRecs, ...popularRecs];
        const seen = new Set<string>();
        const uniqueRecs = allRecs.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });

        // Format with categories
        const recommendations = uniqueRecs.slice(0, 20).map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            imageUrl: item.imageUrl,
            releaseYear: item.releaseYear,
            category: categoryMap[item.categoryId]?.name || 'Unknown',
            categorySlug: categoryMap[item.categoryId]?.slug || 'unknown',
            reason: userCategories.includes(item.categoryId)
                ? `Because you like ${categoryMap[item.categoryId]?.name}`
                : 'Popular pick',
        }));

        return NextResponse.json({
            recommendations,
            based_on: userCategories.map(id => categoryMap[id]?.name).filter(Boolean),
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
}
