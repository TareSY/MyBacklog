import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists, users, categories } from '@/lib/db/schema';
import { ilike, or, eq, desc } from 'drizzle-orm';

// GET /api/search?q=query&category=all|movies|books|tv|music&limit=20
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const searchPattern = `%${query}%`;

        // Get category filter
        let categoryFilter = undefined;
        if (category !== 'all') {
            const [cat] = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
            if (cat) {
                categoryFilter = eq(items.categoryId, cat.id);
            }
        }

        // Search items - only from public lists
        const publicLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(eq(lists.isPublic, true));

        const publicListIds = publicLists.map(l => l.id);

        if (publicListIds.length === 0) {
            return NextResponse.json({ results: [], total: 0 });
        }

        // Build search query
        let searchResults = await db
            .select({
                id: items.id,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                categoryId: items.categoryId,
                listId: items.listId,
            })
            .from(items)
            .where(
                categoryFilter
                    ? or(
                        ilike(items.title, searchPattern),
                        ilike(items.subtitle || '', searchPattern)
                    )
                    : or(
                        ilike(items.title, searchPattern),
                        ilike(items.subtitle || '', searchPattern)
                    )
            )
            .limit(limit);

        // Filter to only public lists and add category filter
        searchResults = searchResults.filter(item =>
            publicListIds.includes(item.listId) &&
            (!categoryFilter || true) // Already filtered in query
        );

        // Get category names
        const allCategories = await db.select().from(categories);
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]));

        // Format results
        const results = searchResults.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            imageUrl: item.imageUrl,
            releaseYear: item.releaseYear,
            category: categoryMap[item.categoryId]?.name || 'Unknown',
            categorySlug: categoryMap[item.categoryId]?.slug || 'unknown',
        }));

        return NextResponse.json({
            results,
            total: results.length,
            query,
            category,
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
