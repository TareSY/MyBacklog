/**
 * TMDB API client for movies and TV shows
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
}

interface TMDBTVShow {
    id: number;
    name: string;
    overview: string;
    first_air_date: string;
    poster_path: string | null;
    vote_average: number;
}

interface TMDBSearchResponse<T> {
    results: T[];
    total_results: number;
}

function getApiKey(): string {
    const key = process.env.TMDB_API_KEY;
    if (!key) {
        throw new Error('TMDB_API_KEY not configured');
    }
    return key;
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${getApiKey()}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status}`);
    }

    const data: TMDBSearchResponse<TMDBMovie> = await res.json();
    return data.results.slice(0, 10);
}

export async function searchTVShows(query: string): Promise<TMDBTVShow[]> {
    const url = `${TMDB_BASE_URL}/search/tv?api_key=${getApiKey()}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status}`);
    }

    const data: TMDBSearchResponse<TMDBTVShow> = await res.json();
    return data.results.slice(0, 10);
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${getApiKey()}&language=en-US&page=1`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data: TMDBSearchResponse<TMDBMovie> = await res.json();
    return data.results.slice(0, 20);
}

export async function getPopularTVShows(): Promise<TMDBTVShow[]> {
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${getApiKey()}&language=en-US&page=1`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data: TMDBSearchResponse<TMDBTVShow> = await res.json();
    return data.results.slice(0, 20);
}

export function getImageUrl(path: string | null): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}${path}`;
}

export function formatMovie(movie: TMDBMovie) {
    return {
        externalId: `tmdb-movie-${movie.id}`,
        externalSource: 'tmdb',
        title: movie.title,
        subtitle: movie.release_date ? `${movie.release_date.split('-')[0]}` : undefined,
        imageUrl: getImageUrl(movie.poster_path),
        releaseYear: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : undefined,
        description: movie.overview?.slice(0, 300),
    };
}

export function formatTVShow(show: TMDBTVShow) {
    return {
        externalId: `tmdb-tv-${show.id}`,
        externalSource: 'tmdb',
        title: show.name,
        subtitle: show.first_air_date ? `${show.first_air_date.split('-')[0]}` : undefined,
        imageUrl: getImageUrl(show.poster_path),
        releaseYear: show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : undefined,
        description: show.overview?.slice(0, 300),
    };
}
