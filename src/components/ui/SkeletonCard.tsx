interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
    return (
        <div
            className={`bg-bg-card rounded-xl overflow-hidden animate-pulse ${className}`}
            aria-hidden="true"
        >
            {/* Image placeholder */}
            <div className="aspect-[2/3] bg-bg-elevated" />
            {/* Content placeholder */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-4 bg-bg-elevated rounded w-3/4" />
                {/* Subtitle */}
                <div className="h-3 bg-bg-elevated rounded w-1/2" />
                {/* Meta */}
                <div className="flex gap-2">
                    <div className="h-3 bg-bg-elevated rounded w-12" />
                    <div className="h-3 bg-bg-elevated rounded w-16" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
