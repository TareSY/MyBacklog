import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists, itemLists } from '@/lib/db/schema';
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

        // Handle both single listId (legacy) and listIds array
        let { listId, listIds, categoryId } = body;

        if (!listIds && listId) {
            listIds = [listId];
        } else if (listIds && listIds.length > 0) {
            // Use the first list as the primary "owner" for the items table
            listId = listIds[0];
        } else {
            return NextResponse.json({ error: 'At least one list is required' }, { status: 400 });
        }

        // Verify user owns all these lists
        const userLists = await db
            .select()
            .from(lists)
            .where(and(eq(lists.userId, session.user.id)));

        const userListIds = new Set(userLists.map(l => l.id));
        const allValid = listIds.every((id: string) => userListIds.has(id));

        if (!allValid) {
            return NextResponse.json({ error: 'One or more lists not found or unauthorized' }, { status: 404 });
        }

        // Use Strategy Pattern for validation and data preparation
        const strategy = ItemStrategyContext.getStrategy(categoryId);

        // Ensure listId is set for validation
        const dataWithListId = { ...body, listId };

        try {
            strategy.validate(dataWithListId);
        } catch (validationError: any) {
            return NextResponse.json({ error: validationError.message }, { status: 400 });
        }

        // Check for duplicates in the PRIMARY list (optional: check all? simplified for now)
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
                { error: 'This item is already in your primary list.' },
                { status: 409 }
            );
        }

        const insertData = strategy.prepareForInsert(body);
        // Ensure primary listId is set
        insertData.listId = listId;

        const [newItem] = await db
            .insert(items)
            .values(insertData as any)
            .returning();

        // Insert into item_lists for ALL selected lists
        const linksToInsert = listIds.map((lid: string) => ({
            itemId: newItem.id,
            listId: lid,
        }));

        if (linksToInsert.length > 0) {
            await db.insert(itemLists).values(linksToInsert).onConflictDoNothing();
        }

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}
