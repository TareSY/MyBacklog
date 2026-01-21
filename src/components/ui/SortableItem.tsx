'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    handle?: boolean;
}

export function SortableItem({ id, children, className, handle = false }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn('group/sortable relative', className)}>
            {/* If we want a dedicated handle, we can position it here. 
                 For now, let's attach listeners to the whole item unless 'handle' prop says otherwise,
                 but usually efficient lists use a handle. Let's try whole-item first or a handle overlay. text selection might be an issue.
                 Let's assume whole item for now but maybe add a grip icon as visual cue */}

            {handle ? (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary z-10 opacity-0 group-hover/sortable:opacity-100 transition-opacity"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
            ) : (
                // If no specific handle requested, maybe apply listeners to a wrapper? 
                // But typically we want the card to be the draggable.
                // Let's pass attributes/listeners to children? No, that's messy.
                // Better: Render a wrapper div that IS the sortable node.
                null
            )}

            {/* If not using a discrete handle, spread listeners on the div itself */}
            {!handle ? (
                <div {...attributes} {...listeners} className="h-full">
                    {children}
                </div>
            ) : (
                <div className="pl-10 h-full">
                    {children}
                </div>
            )}
        </div>
    );
}
