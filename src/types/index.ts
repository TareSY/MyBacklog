// Database model types for MyBacklog

export type Category = 'movies' | 'tv' | 'books' | 'music';

export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    createdAt: Date;
}

export interface Profile {
    id: string;
    username: string;
    avatarUrl?: string;
    createdAt: Date;
}

export interface List {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    shareSlug?: string;
    createdAt: Date;
    updatedAt: Date;
    items?: BacklogItem[];
    itemCount?: number;
}

export interface Genre {
    id: number;
    name: string;
    categoryId: number;
}

export interface BacklogItem {
    id: string;
    listId: string;
    categoryId: number;
    category: Category;
    externalId?: string;
    externalSource?: 'tmdb' | 'google_books' | 'spotify';
    title: string;
    subtitle?: string; // Author, Artist, Director, etc.
    imageUrl?: string;
    releaseYear?: number;
    description?: string;
    isCompleted: boolean;
    completedAt?: Date;
    addedAt: Date;
    notes?: string;
    genres?: Genre[];
}

// API response types for external services
export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
}

export interface TMDBTVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    genre_ids: number[];
}

export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        categories?: string[];
        pageCount?: number;
        averageRating?: number;
    };
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    images: Array<{ url: string; width: number; height: number }>;
    release_date: string;
    total_tracks: number;
    album_type: string;
}

// Search result type (unified across all APIs)
export interface SearchResult {
    id: string;
    externalId: string;
    externalSource: 'tmdb' | 'google_books' | 'spotify';
    category: Category;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    releaseYear?: number;
    description?: string;
    genres?: string[];
}

// Form/input types
export interface CreateListInput {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export interface UpdateListInput {
    name?: string;
    description?: string;
    isPublic?: boolean;
}

export interface AddItemInput {
    listId: string;
    category: Category;
    externalId?: string;
    externalSource?: 'tmdb' | 'google_books' | 'spotify';
    title: string;
    subtitle?: string;
    imageUrl?: string;
    releaseYear?: number;
    description?: string;
    genreIds?: number[];
}

export interface UpdateItemInput {
    isCompleted?: boolean;
    notes?: string;
}

// Filter and sort options
export type SortOption =
    | 'added_desc'
    | 'added_asc'
    | 'title_asc'
    | 'title_desc'
    | 'year_desc'
    | 'year_asc';

export interface FilterOptions {
    category?: Category;
    genreId?: number;
    isCompleted?: boolean;
    search?: string;
}

export interface SortOptions {
    sortBy: SortOption;
}

// API response wrappers
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
