'use client';

interface VennDiagramProps {
    yourCount: number;
    friendCount: number;
    commonCount: number;
    yourLabel?: string;
    friendLabel?: string;
}

export function VennDiagram({
    yourCount,
    friendCount,
    commonCount,
    yourLabel = 'You',
    friendLabel = 'Friend',
}: VennDiagramProps) {
    // Calculate percentages for visual sizing
    const total = yourCount + friendCount - commonCount;
    const maxSize = 120;
    const minSize = 60;

    const yourSize = total > 0
        ? Math.max(minSize, Math.min(maxSize, (yourCount / total) * maxSize * 1.5))
        : minSize;
    const friendSize = total > 0
        ? Math.max(minSize, Math.min(maxSize, (friendCount / total) * maxSize * 1.5))
        : minSize;

    // Overlap amount based on common items
    const overlapRatio = total > 0 ? commonCount / Math.min(yourCount, friendCount) : 0;
    const overlapPx = Math.min(yourSize, friendSize) * overlapRatio * 0.6;

    return (
        <div className="flex flex-col items-center py-6">
            <div className="relative flex items-center justify-center h-32">
                {/* Your circle */}
                <div
                    className="absolute rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center transition-all duration-500"
                    style={{
                        width: yourSize,
                        height: yourSize,
                        left: `calc(50% - ${yourSize / 2 + overlapPx / 2}px)`,
                    }}
                >
                    <span className="text-xl font-bold text-primary">{yourCount}</span>
                </div>

                {/* Friend's circle */}
                <div
                    className="absolute rounded-full bg-secondary/30 border-2 border-secondary flex items-center justify-center transition-all duration-500"
                    style={{
                        width: friendSize,
                        height: friendSize,
                        left: `calc(50% - ${friendSize / 2 - overlapPx / 2}px)`,
                    }}
                >
                    <span className="text-xl font-bold text-secondary">{friendCount}</span>
                </div>

                {/* Common items indicator */}
                {commonCount > 0 && (
                    <div className="absolute z-10 bg-success/90 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg">
                        {commonCount} shared
                    </div>
                )}
            </div>

            {/* Labels */}
            <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-text-secondary">{yourLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm text-text-secondary">Common</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-sm text-text-secondary">{friendLabel}</span>
                </div>
            </div>
        </div>
    );
}
