'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '@/components/ui';
import { ArrowLeft, ExternalLink, Lock, Unlock } from 'lucide-react';

interface Friend {
    id: string;
    name: string;
    username: string;
    image?: string;
}

interface FriendList {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    shareSlug?: string;
    itemCount: number;
    completedCount: number;
}

interface FriendData {
    friend: Friend;
    lists: FriendList[];
}

export default function FriendListsPage() {
    const params = useParams();
    const friendId = params.id as string;
    const [data, setData] = useState<FriendData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFriendLists() {
            try {
                const res = await fetch(`/api/friends/${friendId}/lists`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    const err = await res.json();
                    setError(err.error || 'Failed to load');
                }
            } catch (err) {
                setError('Failed to load friend lists');
            } finally {
                setLoading(false);
            }
        }

        if (friendId) {
            fetchFriendLists();
        }
    }, [friendId]);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="skeleton h-8 w-48 rounded-lg" />
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-32 rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto">
                <EmptyState
                    emoji="🚫"
                    title="Cannot View Lists"
                    description={error}
                    action={
                        <Link href="/friends">
                            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Back to Friends
                            </Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link href="/friends" className="text-primary-light hover:text-primary text-sm mb-4 inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to Friends
                </Link>
                <div className="flex items-center gap-4 mt-4">
                    {data.friend.image ? (
                        <img src={data.friend.image} alt="" className="w-16 h-16 rounded-full" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl text-primary font-bold">
                            {(data.friend.name || data.friend.username)?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            {data.friend.name || data.friend.username}&apos;s Lists
                        </h1>
                        <p className="text-text-muted">@{data.friend.username}</p>
                    </div>
                </div>
            </div>

            {/* Lists */}
            {data.lists.length === 0 ? (
                <Card variant="default">
                    <CardContent className="py-12 text-center">
                        <p className="text-text-muted">
                            {data.friend.name || data.friend.username} hasn&apos;t shared any public lists yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data.lists.map((list) => (
                        <Card key={list.id} variant="default" className="hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {list.name}
                                            {list.isPublic ? (
                                                <Unlock className="w-4 h-4 text-success" />
                                            ) : (
                                                <Lock className="w-4 h-4 text-text-muted" />
                                            )}
                                        </CardTitle>
                                        {list.description && (
                                            <p className="text-sm text-text-muted mt-1">{list.description}</p>
                                        )}
                                    </div>
                                    {list.shareSlug && (
                                        <Link href={`/share/${list.shareSlug}`} target="_blank">
                                            <Button size="sm" variant="ghost" leftIcon={<ExternalLink className="w-4 h-4" />}>
                                                View
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Badge variant="info">{list.itemCount} items</Badge>
                                    <Badge variant="success">{list.completedCount} completed</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
