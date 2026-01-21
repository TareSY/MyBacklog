'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, useToast } from '@/components/ui';
import { UserPlus, Users, Clock, Check, X, Trash2, Eye } from 'lucide-react';

interface Friend {
    id: string;
    name: string;
    username: string;
    image?: string;
}

interface FriendRequest {
    id: string;
    status: string;
    createdAt: string;
    user: Friend;
}

interface FriendsData {
    friends: Friend[];
    pendingReceived: FriendRequest[];
    pendingSent: FriendRequest[];
}

export default function FriendsPage() {
    const { addToast } = useToast();
    const [data, setData] = useState<FriendsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [sending, setSending] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Friend[]>([]);

    async function searchUsers(query: string) {
        setSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    }

    async function fetchFriends() {
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFriends();
    }, []);

    async function sendRequest(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim()) return;

        setSending(true);
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
            });

            if (res.ok) {
                addToast('Friend request sent!', 'success');
                setUsername('');
                fetchFriends();
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to send request', 'error');
            }
        } catch (error) {
            addToast('Failed to send request', 'error');
        } finally {
            setSending(false);
        }
    }

    async function respondToRequest(id: string, action: 'accept' | 'reject') {
        try {
            const res = await fetch(`/api/friends/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                addToast(action === 'accept' ? 'Friend added!' : 'Request declined', 'success');
                fetchFriends();
            }
        } catch (error) {
            addToast('Failed to respond to request', 'error');
        }
    }

    async function removeFriend(id: string) {
        if (!confirm('Remove this friend?')) return;

        try {
            const res = await fetch(`/api/friends/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Friend removed', 'success');
                fetchFriends();
            }
        } catch (error) {
            addToast('Failed to remove friend', 'error');
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-8 w-32 rounded-lg" />
                <div className="skeleton h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <span>Friends</span>
                    <span className="text-2xl">👥</span>
                </h1>
                <p className="text-text-muted mt-2">
                    Connect with friends and share your backlogs
                </p>
            </div>

            {/* Add Friend */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Add Friend
                    </CardTitle>
                    <CardDescription>
                        Search for users by username
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={sendRequest} className="space-y-3">
                        <div className="relative">
                            <Input
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    // Trigger search
                                    if (e.target.value.length >= 2) {
                                        searchUsers(e.target.value);
                                    } else {
                                        setSearchResults([]);
                                    }
                                }}
                                placeholder="Search username..."
                                className="pr-10"
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 rounded-xl border border-border-default bg-bg-surface shadow-lg overflow-hidden">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setUsername(user.username);
                                                setSearchResults([]);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors text-left"
                                        >
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                    {(user.name || user.username)?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-text-primary text-sm">{user.name || user.username}</p>
                                                <p className="text-xs text-text-muted">@{user.username}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button type="submit" isLoading={sending} disabled={!username.trim()}>
                            Send Friend Request
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Pending Received */}
            {data?.pendingReceived && data.pendingReceived.length > 0 && (
                <Card variant="default" className="border-warning/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-warning" />
                            Pending Requests
                            <Badge variant="warning">{data.pendingReceived.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.pendingReceived.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated">
                                <div>
                                    <p className="font-medium text-text-primary">
                                        {request.user?.name || request.user?.username}
                                    </p>
                                    <p className="text-sm text-text-muted">@{request.user?.username}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => respondToRequest(request.id, 'accept')}
                                        leftIcon={<Check className="w-4 h-4" />}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => respondToRequest(request.id, 'reject')}
                                        leftIcon={<X className="w-4 h-4" />}
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Friends List */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-success" />
                        Your Friends
                        <Badge variant="success">{data?.friends?.length || 0}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data?.friends && data.friends.length > 0 ? (
                        <div className="space-y-3">
                            {data.friends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated">
                                    <div className="flex items-center gap-3">
                                        {friend.image ? (
                                            <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {(friend.name || friend.username)?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-text-primary">{friend.name || friend.username}</p>
                                            <p className="text-sm text-text-muted">@{friend.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/friends/${friend.id}`}>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                leftIcon={<Eye className="w-4 h-4" />}
                                            >
                                                View Lists
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-error hover:bg-error/10"
                                            onClick={() => removeFriend(friend.id)}
                                            leftIcon={<Trash2 className="w-4 h-4" />}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-center py-8">
                            No friends yet. Send a request to get started!
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Pending Sent */}
            {data?.pendingSent && data.pendingSent.length > 0 && (
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-text-muted">Sent Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {data.pendingSent.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated">
                                <p className="text-text-secondary">
                                    Waiting for @{request.user?.username}
                                </p>
                                <Badge variant="default">Pending</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
