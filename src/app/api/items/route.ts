import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ItemStrategyContext } from '@/lib/strategies/item-strategy';

// GET /api/items - Get items with filtering
export async function GET(request: NextRequest) {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const listId = searchParams.get('listId');

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json([]);
    }

    try {
        let conditions = [eq(lists.userId, session.user.id)];

        if (listId) {
            conditions.push(eq(items.listId, listId));
        }

        if (categoryId) {
            conditions.push(eq(items.categoryId, parseInt(categoryId)));
        }

        const userItems = await db
            .select({
                item: items,
                listName: lists.name
            })
            .from(items)
            .innerJoin(lists, eq(items.listId, lists.id))
            .where(and(...conditions))
            .orderBy(items.addedAt);

        return NextResponse.json(userItems);
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

// POST /api/items - Add item to a list
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
        const { listId, categoryId } = body;

        // Verify user owns this list
        const [list] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, listId), eq(lists.userId, session.user.id)));

        if (!list) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        // Use Strategy Pattern for validation and data preparation
        const strategy = ItemStrategyContext.getStrategy(categoryId);

        try {
            strategy.validate(body);
        } catch (validationError: any) {
            return NextResponse.json({ error: validationError.message }, { status: 400 });
        }

        // Check for duplicates in the target list
        // Rules: duplicate if same title AND same category.
        // If externalId is present, check that too? No, manual items might not have it.
        // Title comparison should be case-insensitive? Ideally yes.
        const [existing] = await db
            .select()
            .from(items)
            .where(and(
                eq(items.listId, listId),
                eq(items.categoryId, categoryId),
                sql`lower(${items.title}) = lower(${body.title})`
            ))
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: 'This item is already in your list.' },
                { status: 409 }
            );
        }

        const insertData = strategy.prepareForInsert(body);

        const [newItem] = await db
            .insert(items)
            .values(insertData as any)
            .returning();

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}
