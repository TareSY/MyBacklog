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

            <div {...attributes} {...listeners} className="h-full cursor-grab active:cursor-grabbing touch-none">
                {children}
            </div>
        </div>
    );
}
