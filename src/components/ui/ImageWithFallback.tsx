'use client';

import { useState } from 'react';
import { Film, Tv, BookOpen, Music, Gamepad2, ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
    src: string | null | undefined;
    alt: string;
    categoryId?: number;
    className?: string;
}

const categoryIcons: Record<number, React.ElementType> = {
    1: Film,
    2: Tv,
    3: BookOpen,
    4: Music,
    5: Gamepad2,
};

export function ImageWithFallback({
    src,
    alt,
    categoryId = 1,
    className = '',
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const Icon = categoryIcons[categoryId] || ImageOff;

    if (!src || error) {
        return (
            <div
                className={`flex items-center justify-center bg-bg-elevated text-text-muted ${className}`}
                aria-label={`${alt} (image unavailable)`}
            >
                <Icon className="w-1/3 h-1/3 opacity-50" />
            </div>
        );
    }

    return (
        <>
            {loading && (
                <div
                    className={`absolute inset-0 bg-bg-elevated animate-pulse ${className}`}
                    aria-hidden="true"
                />
            )}
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setError(true)}
                onLoad={() => setLoading(false)}
                loading="lazy"
            />
        </>
    );
}
