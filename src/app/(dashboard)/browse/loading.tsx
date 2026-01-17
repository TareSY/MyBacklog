import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function BrowseLoading() {
    return (
        <div className="space-y-12">
            {/* Header skeleton */}
            <div>
                <div className="skeleton h-8 w-40 rounded-lg mb-2" />
                <div className="skeleton h-4 w-64 rounded" />
            </div>

            {/* Category cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-bg-surface border border-border-subtle text-center">
                        <Skeleton variant="circular" className="w-12 h-12 mx-auto mb-4" />
                        <Skeleton variant="text" className="w-20 mx-auto mb-2" />
                        <Skeleton variant="text" className="w-32 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Suggestions skeleton */}
            <div className="space-y-6">
                <Skeleton variant="text" className="w-48 h-6" />
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
