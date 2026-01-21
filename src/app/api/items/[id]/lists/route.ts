import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, itemLists, lists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/items/[id]/lists - Add item to additional lists
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const itemId = params.id;

    try {
        const body = await request.json();
        const { listIds } = body; // Array of list IDs to add item to

        if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
            return NextResponse.json({ error: 'listIds array is required' }, { status: 400 });
        }

        // Verify item exists
        const [item] = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // Verify all lists belong to user
        const userLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(eq(lists.userId, session.user.id));

        const userListIds = new Set(userLists.map(l => l.id));
        const invalidLists = listIds.filter((id: string) => !userListIds.has(id));

        if (invalidLists.length > 0) {
            return NextResponse.json({ error: 'One or more lists do not belong to you' }, { status: 403 });
        }

        // Insert into item_lists (ignore duplicates)
        const insertedLinks = [];
        for (const listId of listIds) {
            try {
                await db.insert(itemLists).values({
                    itemId,
                    listId,
                }).onConflictDoNothing();
                insertedLinks.push(listId);
            } catch (e) {
                // Ignore duplicate errors
            }
        }

        return NextResponse.json({
            message: `Item added to ${insertedLinks.length} list(s)`,
            listIds: insertedLinks,
        });
    } catch (error) {
        console.error('[ITEM_LISTS] Error adding item to lists:', error);
        return NextResponse.json({ error: 'Failed to add item to lists' }, { status: 500 });
    }
}

// GET /api/items/[id]/lists - Get all lists an item belongs to
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const itemId = params.id;

    try {
        // Get item_lists entries for this item
        const itemListEntries = await db
            .select({
                listId: itemLists.listId,
                addedAt: itemLists.addedAt,
            })
            .from(itemLists)
            .where(eq(itemLists.itemId, itemId));

        // Get list details
        const listDetails = await Promise.all(
            itemListEntries.map(async (entry) => {
                const [list] = await db
                    .select({ id: lists.id, name: lists.name })
                    .from(lists)
                    .where(eq(lists.id, entry.listId))
                    .limit(1);
                return list ? { ...list, addedAt: entry.addedAt } : null;
            })
        );

        return NextResponse.json(listDetails.filter(Boolean));
    } catch (error) {
        console.error('[ITEM_LISTS] Error fetching item lists:', error);
        return NextResponse.json({ error: 'Failed to fetch item lists' }, { status: 500 });
    }
}

// DELETE /api/items/[id]/lists - Remove item from a list
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const itemId = params.id;
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    if (!listId) {
        return NextResponse.json({ error: 'listId query param is required' }, { status: 400 });
    }

    try {
        // Verify list belongs to user
        const [list] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, listId), eq(lists.userId, session.user.id)))
            .limit(1);

        if (!list) {
            return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 });
        }

        await db
            .delete(itemLists)
            .where(and(eq(itemLists.itemId, itemId), eq(itemLists.listId, listId)));

        return NextResponse.json({ message: 'Item removed from list' });
    } catch (error) {
        console.error('[ITEM_LISTS] Error removing item from list:', error);
        return NextResponse.json({ error: 'Failed to remove item from list' }, { status: 500 });
    }
}
