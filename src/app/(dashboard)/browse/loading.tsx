import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function BrowseLoading() {
    return (
        <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div>
                <div className="h-8 w-40 bg-bg-elevated rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-64 bg-bg-elevated rounded animate-pulse" />
            </div>

            {/* Category cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-bg-card border border-border-subtle text-center animate-pulse">
                        <div className="w-12 h-12 bg-bg-elevated rounded-full mx-auto mb-4" />
                        <div className="h-5 w-20 bg-bg-elevated rounded mx-auto mb-2" />
                        <div className="h-4 w-32 bg-bg-elevated rounded mx-auto" />
                    </div>
                ))}
            </div>

            {/* Suggestions skeleton */}
            <div className="space-y-6">
                <div className="h-6 w-48 bg-bg-elevated rounded animate-pulse" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

