'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, EmptyState, Button } from '@/components/ui';
import { Sparkles, RefreshCw, Film, Tv, BookOpen, Music, Plus } from 'lucide-react';

interface Recommendation {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    releaseYear?: number;
    category: string;
    categorySlug: string;
    reason: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    movies: <Film className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    books: <BookOpen className="w-4 h-4" />,
    music: <Music className="w-4 h-4" />,
};

export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [basedOn, setBasedOn] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchRecommendations() {
        setLoading(true);
        try {
            const res = await fetch('/api/recommendations');
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);
                setBasedOn(data.based_on || []);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-warning" />
                        For You
                    </h1>
                    <p className="text-text-muted mt-2">
                        Personalized recommendations based on your interests
                    </p>
                    {basedOn.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {basedOn.map((cat) => (
                                <Badge key={cat} variant="info">{cat}</Badge>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    onClick={fetchRecommendations}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    isLoading={loading}
                >
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-xl" />
                    ))}
                </div>
            ) : recommendations.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                        <Card key={rec.id} variant="default" className="hover:border-primary/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex gap-4 py-4">
                                {rec.imageUrl ? (
                                    <img
                                        src={rec.imageUrl}
                                        alt={rec.title}
                                        className="w-20 h-28 object-cover rounded-lg shrink-0"
                                    />
                                ) : (
                                    <div className="w-20 h-28 bg-bg-elevated rounded-lg flex items-center justify-center text-text-muted shrink-0">
                                        {categoryIcons[rec.categorySlug] || <Sparkles className="w-6 h-6" />}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text-primary line-clamp-2">{rec.title}</h3>
                                    {rec.subtitle && (
                                        <p className="text-sm text-text-muted truncate mt-1">{rec.subtitle}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="default">{rec.category}</Badge>
                                        {rec.releaseYear && (
                                            <span className="text-xs text-text-disabled">{rec.releaseYear}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-primary-light mt-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {rec.reason}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    emoji="✨"
                    title="No Recommendations Yet"
                    description="Add some items to your lists and we'll suggest more things you might like!"
                />
            )}
        </div>
    );
}
