import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SkeletonCardGrid } from '@/components/ui/SkeletonCard';

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Welcome header skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-bg-elevated rounded w-64 animate-pulse" />
                <div className="h-4 bg-bg-elevated rounded w-48 animate-pulse" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-bg-card rounded-xl p-4 animate-pulse"
                    >
                        <div className="h-8 bg-bg-elevated rounded w-12 mb-2" />
                        <div className="h-4 bg-bg-elevated rounded w-20" />
                    </div>
                ))}
            </div>

            {/* Featured content skeleton */}
            <div className="space-y-4">
                <div className="h-6 bg-bg-elevated rounded w-48 animate-pulse" />
                <SkeletonCardGrid count={6} />
            </div>

            {/* Center spinner for emphasis */}
            <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
            </div>
        </div>
    );
}
