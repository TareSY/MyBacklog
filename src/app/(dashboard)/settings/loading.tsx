import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header skeleton */}
            <div>
                <div className="skeleton h-8 w-32 rounded-lg mb-2" />
                <div className="skeleton h-4 w-48 rounded" />
            </div>

            {/* Profile card skeleton */}
            <div className="p-6 rounded-2xl bg-bg-surface border border-border-subtle space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton variant="circular" className="w-5 h-5" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <div className="space-y-4">
                    <div>
                        <Skeleton variant="text" className="w-16 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-10" />
                    </div>
                    <div>
                        <Skeleton variant="text" className="w-24 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-10" />
                    </div>
                    <Skeleton variant="rectangular" className="w-32 h-10" />
                </div>
            </div>

            {/* Security card skeleton */}
            <div className="p-6 rounded-2xl bg-bg-surface border border-border-subtle">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton variant="circular" className="w-5 h-5" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <Skeleton variant="text" className="w-full h-4 mb-4" />
                <Skeleton variant="rectangular" className="w-48 h-10" />
            </div>
        </div>
    );
}
