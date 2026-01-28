import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function ListsLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="skeleton h-8 w-32 rounded-lg mb-2" />
                    <div className="skeleton h-4 w-48 rounded" />
                </div>
                <div className="skeleton h-10 w-32 rounded-xl" />
            </div>

            {/* Lists grid skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}
