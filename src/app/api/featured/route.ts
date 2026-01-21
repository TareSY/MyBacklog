import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({
            movies: [],
            tv: [],
            books: [],
            music: [],
            games: []
        });
    }

    try {
        const userId = session.user.id;

        // Categories: 1=Movie, 2=TV, 3=Book, 4=Music, 5=Game
        const categories = [
            { id: 1, key: 'movies' },
            { id: 2, key: 'tv' },
            { id: 3, key: 'books' },
            { id: 4, key: 'music' },
            { id: 5, key: 'games' }
        ];

        // Fetch top 5 recent items for each category
        // We can run these in parallel for efficiency
        const results = await Promise.all(
            categories.map(async (cat) => {
                const recentItems = await db
                    .select({
                        id: items.id,
                        title: items.title,
                        imageUrl: items.imageUrl,
                        categoryId: items.categoryId,
                        releaseYear: items.releaseYear,
                        rating: items.rating,
                        addedAt: items.addedAt,
                        listId: items.listId
                    })
                    .from(items)
                    .innerJoin(lists, eq(items.listId, lists.id))
                    .where(and(
                        eq(lists.userId, userId),
                        eq(items.categoryId, cat.id)
                    ))
                    .orderBy(desc(items.addedAt))
                    .limit(5);

                return { key: cat.key, items: recentItems };
            })
        );

        // Convert array of results to object keyed by category slug
        const responseData = results.reduce((acc, curr) => {
            acc[curr.key] = curr.items;
            return acc;
        }, {} as Record<string, any[]>);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching featured items:', error);
        return NextResponse.json({ error: 'Failed to fetch featured items' }, { status: 500 });
    }
}
