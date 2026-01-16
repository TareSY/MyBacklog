import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names with clsx
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return formatDate(d);
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get TMDB image URL
 */
export function getTMDBImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: 'movies' | 'tv' | 'books' | 'music'): string {
    const names = {
        movies: 'Movies',
        tv: 'TV Shows',
        books: 'Books',
        music: 'Music',
    };
    return names[category];
}

/**
 * Get category icon name (for lucide-react)
 */
export function getCategoryIcon(category: 'movies' | 'tv' | 'books' | 'music'): string {
    const icons = {
        movies: 'Film',
        tv: 'Tv',
        books: 'BookOpen',
        music: 'Music',
    };
    return icons[category];
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Sleep for a given duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
    if (typeof window !== 'undefined') return '';
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}
