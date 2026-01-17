import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = 'skeleton animate-pulse';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-2xl',
    };

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
    return (
        <div className="p-6 rounded-2xl bg-bg-surface border border-border-subtle">
            <Skeleton variant="rectangular" className="w-full h-40 mb-4" />
            <Skeleton variant="text" className="w-3/4 mb-2" />
            <Skeleton variant="text" className="w-1/2 mb-4" />
            <div className="flex gap-2">
                <Skeleton variant="rectangular" className="w-20 h-6" />
                <Skeleton variant="rectangular" className="w-16 h-6" />
            </div>
        </div>
    );
}

export function SkeletonListItem() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-elevated">
            <Skeleton variant="rectangular" className="w-16 h-16 shrink-0" />
            <div className="flex-1">
                <Skeleton variant="text" className="w-1/2 mb-2" />
                <Skeleton variant="text" className="w-1/3" />
            </div>
            <Skeleton variant="circular" className="w-8 h-8" />
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-bg-surface border border-border-subtle">
                        <Skeleton variant="text" className="w-1/2 mb-2" />
                        <Skeleton variant="text" className="w-1/3 h-8" />
                    </div>
                ))}
            </div>

            {/* Recent items */}
            <div>
                <Skeleton variant="text" className="w-32 h-6 mb-4" />
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonListItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
