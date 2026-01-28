'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '@/components/ui';
import { VennDiagram } from '@/components/ui/VennDiagram';
import { ArrowLeft, BarChart3, Check, X } from 'lucide-react';

interface CompareData {
    friend: { id: string; name: string; username: string };
    stats: {
        yourTotal: number;
        friendTotal: number;
        common: number;
        onlyYou: number;
        onlyFriend: number;
    };
    common: { title: string; category: string; isCompleted: boolean }[];
    onlyYou: { title: string; category: string; isCompleted: boolean }[];
    onlyFriend: { title: string; category: string; isCompleted: boolean }[];
}

export default function ComparePage() {
    const params = useParams();
    const friendId = params.id as string;
    const [data, setData] = useState<CompareData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompare() {
            try {
                const res = await fetch(`/api/friends/${friendId}/compare`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    setError((await res.json()).error || 'Failed to load');
                }
            } catch {
                setError('Failed to load comparison');
            } finally {
                setLoading(false);
            }
        }

        if (friendId) fetchCompare();
    }, [friendId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-8 w-48 bg-bg-elevated rounded-lg animate-pulse" />
                <div className="h-32 bg-bg-elevated rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <EmptyState
                emoji="🚫"
                title="Cannot Compare"
                description={error || 'Unable to load comparison'}
                action={<Link href="/friends"><Button>Back to Friends</Button></Link>}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link href={`/friends/${friendId}`} className="text-primary-light hover:text-primary text-sm inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to {data.friend.name || data.friend.username}
                </Link>
                <h1 className="text-2xl font-bold text-text-primary mt-4 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Compare Backlogs
                </h1>
            </div>

            {/* Venn Diagram */}
            <Card variant="glass">
                <CardContent className="py-4">
                    <VennDiagram
                        yourCount={data.stats.yourTotal}
                        friendCount={data.stats.friendTotal}
                        commonCount={data.stats.common}
                        yourLabel="You"
                        friendLabel={data.friend.name || data.friend.username}
                    />
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card variant="default" className="text-center">
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold text-primary">{data.stats.yourTotal}</p>
                        <p className="text-xs text-text-muted">Your Items</p>
                    </CardContent>
                </Card>
                <Card variant="default" className="text-center">
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold text-secondary">{data.stats.friendTotal}</p>
                        <p className="text-xs text-text-muted">{data.friend.name}&apos;s Items</p>
                    </CardContent>
                </Card>
                <Card variant="default" className="text-center border-success/30">
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold text-success">{data.stats.common}</p>
                        <p className="text-xs text-text-muted">In Common</p>
                    </CardContent>
                </Card>
                <Card variant="default" className="text-center">
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold text-info">{data.stats.onlyYou}</p>
                        <p className="text-xs text-text-muted">Only You</p>
                    </CardContent>
                </Card>
                <Card variant="default" className="text-center">
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold text-warning">{data.stats.onlyFriend}</p>
                        <p className="text-xs text-text-muted">Only {data.friend.name}</p>
                    </CardContent>
                </Card>
            </div>

            {/* In Common */}
            <Card variant="default" className="border-success/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success">
                        <Check className="w-5 h-5" /> In Common ({data.stats.common})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.common.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {data.common.map((item, i) => (
                                <Badge key={i} variant="success">{item.title}</Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted">No items in common yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Side by side */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-info">Only in Your Backlog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.onlyYou.length > 0 ? (
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {data.onlyYou.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-bg-elevated">
                                        <span className="text-sm text-text-primary truncate">{item.title}</span>
                                        <Badge variant="default" className="text-xs">{item.category}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm">Everything you have, they have too!</p>
                        )}
                    </CardContent>
                </Card>

                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-warning">Only in {data.friend.name}&apos;s Backlog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.onlyFriend.length > 0 ? (
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {data.onlyFriend.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-bg-elevated">
                                        <span className="text-sm text-text-primary truncate">{item.title}</span>
                                        <Badge variant="default" className="text-xs">{item.category}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm">You have everything they have!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
