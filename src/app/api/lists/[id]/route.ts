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

        // If making public and no slug exists, generate one
        // We need to fetch the current list first to check existing slug if not provided, 
        // but for simplicity, we can just check if we are setting isPublic=true.
        // Actually, let's just generate it if isPublic is true.
        // We'll trust Drizzle to not overwrite if we handle it right, or we valid check.
        // Let's rely on standard practice: always ensure slug if public.

        let shareSlug = undefined;
        if (isPublic) {
            // Check if it already has one
            const [current] = await db
                .select()
                .from(lists)
                .where(and(eq(lists.id, id), eq(lists.userId, session.user.id)));

            if (current && !current.shareSlug) {
                // Generate simple 8-char slug
                shareSlug = Math.random().toString(36).substring(2, 10);
                // Check collision (simple loop or just hope? MVP: Retry once)
                // Real app: use nanoid and loop.
            }
        }

        const updateData: any = {
            name,
            description,
            isPublic,
            updatedAt: new Date(),
        };
        if (shareSlug) {
            updateData.shareSlug = shareSlug;
        }

        const [updated] = await db
            .update(lists)
            .set(updateData)
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
