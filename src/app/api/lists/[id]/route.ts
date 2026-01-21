import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { lists, items, itemLists } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';

// GET /api/lists/[id] - Get a specific list with items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();

    if (!isDatabaseConfigured()) {
        return NextResponse.json({
            id,
            name: 'My Backlog',
            items: [],
        });
    }

    try {
        const [list] = await db
            .select()
            .from(lists)
            .where(eq(lists.id, id));

        if (!list) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        // Check if user can access this list
        if (!list.isPublic && list.userId !== session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get items for this list, joined with item_lists for position and inclusion
        // We use item_lists as the source of truth for "what is in this list"
        const listItems = await db
            .select({
                id: items.id,
                listId: items.listId, // Original listId
                categoryId: items.categoryId,
                externalId: items.externalId,
                externalSource: items.externalSource,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                description: items.description,
                isCompleted: items.isCompleted,
                completedAt: items.completedAt,
                // Use addedAt and position from the join table to respect this specific list's order
                addedAt: itemLists.addedAt,
                notes: items.notes,
                rating: items.rating,
                platform: items.platform,
                placeId: items.placeId,
                address: items.address,
                latitude: items.latitude,
                longitude: items.longitude,
                subtype: items.subtype,
                position: itemLists.position
            })
            .from(items)
            .innerJoin(itemLists, eq(items.id, itemLists.itemId))
            .where(eq(itemLists.listId, id))
            .orderBy(itemLists.position, itemLists.addedAt);

        return NextResponse.json({ ...list, items: listItems });
    } catch (error) {
        console.error('Error fetching list:', error);
        return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
    }
}

// PUT /api/lists/[id] - Update a list
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        const [updated] = await db
            .update(lists)
            .set({
                name,
                description,
                isPublic,
                updatedAt: new Date(),
            })
            .where(and(eq(lists.id, id), eq(lists.userId, session.user.id)))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating list:', error);
        return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
    }
}

// DELETE /api/lists/[id] - Delete a list
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const [deleted] = await db
            .delete(lists)
            .where(and(eq(lists.id, id), eq(lists.userId, session.user.id)))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting list:', error);
        return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
    }
}
