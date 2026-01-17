import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { friendships, users } from '@/lib/db/schema';
import { eq, or, and } from 'drizzle-orm';

// GET /api/friends - Get all friends and pending requests
export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const userId = session.user.id;

        // Get all friendships where user is involved
        const allFriendships = await db
            .select({
                id: friendships.id,
                requesterId: friendships.requesterId,
                addresseeId: friendships.addresseeId,
                status: friendships.status,
                createdAt: friendships.createdAt,
            })
            .from(friendships)
            .where(
                or(
                    eq(friendships.requesterId, userId),
                    eq(friendships.addresseeId, userId)
                )
            );

        // Separate into categories
        const friends = allFriendships.filter(f => f.status === 'accepted');
        const pendingReceived = allFriendships.filter(
            f => f.status === 'pending' && f.addresseeId === userId
        );
        const pendingSent = allFriendships.filter(
            f => f.status === 'pending' && f.requesterId === userId
        );

        // Get friend user details
        const friendIds = friends.map(f =>
            f.requesterId === userId ? f.addresseeId : f.requesterId
        );

        let friendUsers: any[] = [];
        if (friendIds.length > 0) {
            friendUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    image: users.image,
                })
                .from(users)
                .where(or(...friendIds.map(id => eq(users.id, id))));
        }

        // Get pending request user details
        const pendingUserIds = [
            ...pendingReceived.map(f => f.requesterId),
            ...pendingSent.map(f => f.addresseeId),
        ];

        let pendingUsers: any[] = [];
        if (pendingUserIds.length > 0) {
            pendingUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    image: users.image,
                })
                .from(users)
                .where(or(...pendingUserIds.map(id => eq(users.id, id))));
        }

        return NextResponse.json({
            friends: friendUsers,
            pendingReceived: pendingReceived.map(p => ({
                ...p,
                user: pendingUsers.find(u => u.id === p.requesterId),
            })),
            pendingSent: pendingSent.map(p => ({
                ...p,
                user: pendingUsers.find(u => u.id === p.addresseeId),
            })),
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }
}

// POST /api/friends - Send friend request
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
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        // Find user by username
        const targetUser = await db
            .select()
            .from(users)
            .where(eq(users.username, username.toLowerCase().trim()))
            .limit(1);

        if (targetUser.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (targetUser[0].id === session.user.id) {
            return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
        }

        // Check if friendship already exists
        const existing = await db
            .select()
            .from(friendships)
            .where(
                or(
                    and(
                        eq(friendships.requesterId, session.user.id),
                        eq(friendships.addresseeId, targetUser[0].id)
                    ),
                    and(
                        eq(friendships.requesterId, targetUser[0].id),
                        eq(friendships.addresseeId, session.user.id)
                    )
                )
            )
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });
        }

        // Create friend request
        const [newFriendship] = await db
            .insert(friendships)
            .values({
                requesterId: session.user.id,
                addresseeId: targetUser[0].id,
                status: 'pending',
            })
            .returning();

        return NextResponse.json(newFriendship, { status: 201 });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
    }
}
