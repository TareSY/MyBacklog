'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    className?: string;
    label?: string;
}

export function BackButton({ className, label = 'Back' }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={cn(
                'inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors',
                className
            )}
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </button>
    );
}
