import { SkeletonDashboard } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div>
                <div className="skeleton h-8 w-48 rounded-lg mb-2" />
                <div className="skeleton h-4 w-64 rounded" />
            </div>

            <SkeletonDashboard />
        </div>
    );
}
