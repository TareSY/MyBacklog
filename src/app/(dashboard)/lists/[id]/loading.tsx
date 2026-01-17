import { SkeletonListItem } from '@/components/ui/Skeleton';

export default function ListDetailLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="skeleton h-8 w-48 rounded-lg mb-2" />
                    <div className="skeleton h-4 w-32 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="skeleton h-10 w-24 rounded-xl" />
                    <div className="skeleton h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Filter tabs skeleton */}
            <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-8 w-20 rounded-full" />
                ))}
            </div>

            {/* Items list skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonListItem key={i} />
                ))}
            </div>
        </div>
    );
}
