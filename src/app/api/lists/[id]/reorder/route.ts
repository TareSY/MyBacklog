import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { itemLists, lists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();

    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Verify ownership
    const [list] = await db.select().from(lists).where(and(eq(lists.id, id), eq(lists.userId, session.user.id)));
    if (!list) return new NextResponse("List not found", { status: 404 });

    const body = await request.json();
    const { items: reorderedItems } = body as { items: { id: string; position: number }[] };

    if (!Array.isArray(reorderedItems)) {
        return new NextResponse("Invalid body", { status: 400 });
    }

    try {
        // Parallel updates using Promise.all
        // This is safe enough for this use case as we are owner
        await Promise.all(reorderedItems.map(item =>
            db
                .update(itemLists)
                .set({ position: item.position })
                .where(and(
                    eq(itemLists.listId, id),
                    eq(itemLists.itemId, item.id)
                ))
        ));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return new NextResponse("Error updating positions", { status: 500 });
    }
}
