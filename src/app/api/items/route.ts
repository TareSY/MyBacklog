import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { items, lists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ItemStrategyContext } from '@/lib/strategies/item-strategy';

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
