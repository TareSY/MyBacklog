import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT /api/items/[id] - Update an item (mark complete, add notes, etc.)
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
        const { isCompleted, notes, rating } = body;

        // Get the item and verify ownership
        const [item] = await db.select().from(items).where(eq(items.id, id));
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const [list] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, item.listId), eq(lists.userId, session.user.id)));

        if (!list) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updateData: any = {};
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted ? new Date() : null;
        }
        if (notes !== undefined) updateData.notes = notes;
        if (rating !== undefined) updateData.rating = rating;

        const [updated] = await db
            .update(items)
            .set(updateData)
            .where(eq(items.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

// DELETE /api/items/[id] - Remove an item
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
        // Get the item and verify ownership
        const [item] = await db.select().from(items).where(eq(items.id, id));
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const [list] = await db
            .select()
            .from(lists)
            .where(and(eq(lists.id, item.listId), eq(lists.userId, session.user.id)));

        if (!list) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db.delete(items).where(eq(items.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
