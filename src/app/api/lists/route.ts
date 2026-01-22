import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { lists, items, categories } from '@/lib/db/schema';
import { eq, or, and, sql } from 'drizzle-orm';

// GET /api/lists - Get lists (user's + public featured)
export async function GET(request: NextRequest) {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'mine', 'public'

    if (!isDatabaseConfigured()) {
        // Return mock data for development
        return NextResponse.json([
            { id: 'mock-list-1', name: 'My Backlog', description: null, isPublic: false, itemCount: 0 }
        ]);
    }

    try {
        let whereClause;

        if (type === 'public') {
            whereClause = eq(lists.isPublic, true);
        } else if (session?.user?.id) {
            // Get user's lists AND public lists usually, but let's separate them
            if (type === 'mine') {
                whereClause = eq(lists.userId, session.user.id);
            } else {
                // Default: fetch user's lists
                whereClause = eq(lists.userId, session.user.id);
            }
        } else {
            // Not logged in? Get public lists only
            whereClause = eq(lists.isPublic, true);
        }

        const result = await db
            .select()
            .from(lists)
            .where(whereClause)
            .orderBy(lists.createdAt);

        // Auto-fix: Ensure user has a Primary list
        if (session?.user?.id && type !== 'public') {
            const userId = session.user.id;
            const myLists = result.filter(l => l.userId === userId);
            if (myLists.length > 0 && !myLists.some(l => l.isPrimary)) {
                // Set the first/oldest list as primary
                const firstList = myLists[0];
                await db
                    .update(lists)
                    .set({ isPrimary: true })
                    .where(eq(lists.id, firstList.id));
                firstList.isPrimary = true; // Update local for response
            }
        }

        if (type === 'public') {
            const listsWithItems = await Promise.all(result.map(async (list) => {
                const listItems = await db.select().from(items).where(eq(items.listId, list.id)).limit(10);
                return { ...list, items: listItems };
            }));
            return NextResponse.json(listsWithItems);
        }

        // For user lists, attach stats using a SINGLE batched query (no N+1)
        const listIds = result.map(l => l.id);

        // Get all counts in one query
        const allCounts = listIds.length > 0 ? await db
            .select({
                listId: items.listId,
                categoryId: items.categoryId,
                count: sql<number>`count(*)`
            })
            .from(items)
            .where(sql`${items.listId} IN (${sql.join(listIds.map(id => sql`${id}`), sql`, `)})`)
            .groupBy(items.listId, items.categoryId) : [];

        // Build a map of listId -> stats
        const statsMap: Record<string, { movies: number; tv: number; books: number; music: number; games: number }> = {};
        listIds.forEach(id => {
            statsMap[id] = { movies: 0, tv: 0, books: 0, music: 0, games: 0 };
        });

        allCounts.forEach(c => {
            const count = Number(c.count);
            if (!statsMap[c.listId]) return;
            if (c.categoryId === 1) statsMap[c.listId].movies = count;
            else if (c.categoryId === 2) statsMap[c.listId].tv = count;
            else if (c.categoryId === 3) statsMap[c.listId].books = count;
            else if (c.categoryId === 4) statsMap[c.listId].music = count;
            else if (c.categoryId === 5) statsMap[c.listId].games = count;
        });

        const listsWithStats = result.map(list => ({
            ...list,
            stats: statsMap[list.id] || { movies: 0, tv: 0, books: 0, music: 0, games: 0 }
        }));

        return NextResponse.json(listsWithStats);
    } catch (error) {
        console.error('Error fetching lists:', error);
        return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }
}

// POST /api/lists - Create a new list
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
        const { name, description, isPublic } = body;

        // Check if this is the first list
        const [existing] = await db
            .select()
            .from(lists)
            .where(eq(lists.userId, session.user.id))
            .limit(1);

        const [newList] = await db
            .insert(lists)
            .values({
                userId: session.user.id,
                name: name || 'My Backlog',
                description,
                isPublic: Boolean(isPublic),
                isPrimary: !existing // True if no existing lists
            })
            .returning();

        return NextResponse.json(newList, { status: 201 });
    } catch (error) {
        console.error('Error creating list:', error);
        return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
    }
}
