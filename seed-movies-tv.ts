/**
 * Seed script for movies and TV shows using TMDB API
 * Run: npx tsx seed-movies-tv.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

interface TMDBResult {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    poster_path: string | null;
}

async function fetchTMDB(endpoint: string): Promise<TMDBResult[]> {
    const url = `${TMDB_BASE}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
}

async function main() {
    console.log('🎬 Seeding movies and TV shows from TMDB...\n');

    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY not set in .env');
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not set');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get curator
    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app',
            name: 'Curator',
            username: 'curator',
        }).returning();
    }

    // Get categories
    const [moviesCategory] = await db.select().from(categories).where(eq(categories.slug, 'movies'));
    const [tvCategory] = await db.select().from(categories).where(eq(categories.slug, 'tv'));

    if (!moviesCategory || !tvCategory) {
        console.error('❌ Categories not found');
        process.exit(1);
    }

    // Create Featured Movies list
    let [moviesList] = await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Movies')));

    if (!moviesList) {
        [moviesList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Movies',
            description: 'Must-watch films curated from TMDB',
            isPublic: true,
            shareSlug: 'featured-movies',
        }).returning();
    }

    // Create Featured TV list
    let [tvList] = await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured TV Shows')));

    if (!tvList) {
        [tvList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured TV Shows',
            description: 'Must-watch series curated from TMDB',
            isPublic: true,
            shareSlug: 'featured-tv',
        }).returning();
    }

    // Fetch from multiple endpoints
    const movieEndpoints = ['/movie/popular', '/movie/top_rated', '/movie/now_playing'];
    const tvEndpoints = ['/tv/popular', '/tv/top_rated', '/tv/on_the_air'];

    let moviesAdded = 0;
    let tvAdded = 0;

    // Seed movies
    console.log('🎥 Fetching movies...');
    for (const endpoint of movieEndpoints) {
        const movies = await fetchTMDB(endpoint);

        for (const movie of movies) {
            const title = movie.title || 'Unknown';
            const year = movie.release_date?.split('-')[0];

            try {
                await db.insert(items).values({
                    listId: moviesList.id,
                    categoryId: moviesCategory.id,
                    externalId: `tmdb-movie-${movie.id}`,
                    externalSource: 'tmdb',
                    title,
                    subtitle: year,
                    imageUrl: movie.poster_path ? `${TMDB_IMAGE}${movie.poster_path}` : null,
                    releaseYear: year ? parseInt(year) : undefined,
                    description: movie.overview?.slice(0, 300),
                });
                moviesAdded++;
            } catch {
                // Skip duplicates
            }
        }
        await new Promise(r => setTimeout(r, 250));
    }

    // Seed TV shows
    console.log('📺 Fetching TV shows...');
    for (const endpoint of tvEndpoints) {
        const shows = await fetchTMDB(endpoint);

        for (const show of shows) {
            const title = show.name || 'Unknown';
            const year = show.first_air_date?.split('-')[0];

            try {
                await db.insert(items).values({
                    listId: tvList.id,
                    categoryId: tvCategory.id,
                    externalId: `tmdb-tv-${show.id}`,
                    externalSource: 'tmdb',
                    title,
                    subtitle: year,
                    imageUrl: show.poster_path ? `${TMDB_IMAGE}${show.poster_path}` : null,
                    releaseYear: year ? parseInt(year) : undefined,
                    description: show.overview?.slice(0, 300),
                });
                tvAdded++;
            } catch {
                // Skip duplicates
            }
        }
        await new Promise(r => setTimeout(r, 250));
    }

    console.log(`\n✨ Done!`);
    console.log(`   🎥 Movies added: ${moviesAdded}`);
    console.log(`   📺 TV shows added: ${tvAdded}`);
    console.log(`   📖 View at: /share/featured-movies and /share/featured-tv`);
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
