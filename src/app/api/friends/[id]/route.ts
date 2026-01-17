import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { friendships } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

// PUT /api/friends/[id] - Accept/reject friend request
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { action } = body; // 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Find the friendship request
        const friendship = await db
            .select()
            .from(friendships)
            .where(eq(friendships.id, id))
            .limit(1);

        if (friendship.length === 0) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        // Only addressee can accept/reject
        if (friendship[0].addresseeId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update status
        const [updated] = await db
            .update(friendships)
            .set({
                status: action === 'accept' ? 'accepted' : 'rejected',
                updatedAt: new Date(),
            })
            .where(eq(friendships.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating friend request:', error);
        return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
    }
}

// DELETE /api/friends/[id] - Remove friend or cancel request
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const { id } = await params;

        // Find the friendship
        const friendship = await db
            .select()
            .from(friendships)
            .where(eq(friendships.id, id))
            .limit(1);

        if (friendship.length === 0) {
            return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
        }

        // Only participants can delete
        if (
            friendship[0].requesterId !== session.user.id &&
            friendship[0].addresseeId !== session.user.id
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await db.delete(friendships).where(eq(friendships.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing friend:', error);
        return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
    }
}
