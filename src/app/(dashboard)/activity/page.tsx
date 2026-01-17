'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '@/components/ui';
import { Activity, BookOpen, Film, Music, Tv, Users, Plus, Check } from 'lucide-react';

interface ActivityItem {
    id: string;
    action: string;
    targetType: string;
    targetTitle: string;
    createdAt: string;
    user: { id: string; name: string; username: string; image?: string };
    isCurrentUser: boolean;
}

const actionIcons: Record<string, React.ReactNode> = {
    added_item: <Plus className="w-4 h-4" />,
    completed_item: <Check className="w-4 h-4" />,
    created_list: <BookOpen className="w-4 h-4" />,
    added_friend: <Users className="w-4 h-4" />,
};

const actionText: Record<string, string> = {
    added_item: 'added',
    completed_item: 'completed',
    created_list: 'created list',
    added_friend: 'became friends with',
};

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const res = await fetch('/api/activity');
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data.activities || []);
                }
            } catch (error) {
                console.error('Error fetching activity:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="skeleton h-8 w-32 rounded-lg" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary" />
                    Activity Feed
                </h1>
                <p className="text-text-muted mt-2">See what you and your friends are tracking</p>
            </div>

            {activities.length === 0 ? (
                <EmptyState
                    emoji="📭"
                    title="No Activity Yet"
                    description="Activity from you and your friends will appear here"
                />
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <Card key={activity.id} variant="default" className="hover:border-primary/20 transition-colors">
                            <CardContent className="flex items-center gap-4 py-4">
                                {/* Avatar */}
                                {activity.user?.image ? (
                                    <img src={activity.user.image} alt="" className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {(activity.user?.name || activity.user?.username)?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary">
                                        <span className={activity.isCurrentUser ? 'text-primary font-medium' : 'font-medium'}>
                                            {activity.isCurrentUser ? 'You' : activity.user?.name || activity.user?.username}
                                        </span>
                                        {' '}
                                        <span className="text-text-muted">
                                            {actionText[activity.action] || activity.action}
                                        </span>
                                        {' '}
                                        <span className="font-medium">{activity.targetTitle}</span>
                                    </p>
                                    <p className="text-xs text-text-disabled mt-1">
                                        {formatTime(activity.createdAt)}
                                    </p>
                                </div>

                                {/* Icon */}
                                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted">
                                    {actionIcons[activity.action]}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
