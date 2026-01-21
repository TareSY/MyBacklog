/**
 * Scale movies to 10,000 items via TMDB
 * Run: npx tsx seed-movies-10k.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

async function fetchTMDB(endpoint: string, page: number = 1): Promise<any[]> {
    const url = `${TMDB_BASE}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch { return []; }
}

async function main() {
    console.log('🎬 Scaling movies to 10,000 items...\n');

    if (!TMDB_API_KEY) { console.error('❌ TMDB_API_KEY not set'); process.exit(1); }

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    // Get curator user
    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    // Get categories
    const [moviesCategory] = await db.select().from(categories).where(eq(categories.slug, 'movies'));
    if (!moviesCategory) { console.error('❌ Movies category not found'); process.exit(1); }

    // Get or create Featured Movies list
    let [moviesList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Movies')));
    if (!moviesList) {
        [moviesList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured Movies',
            description: 'A collection of must-watch films.', isPublic: true, shareSlug: 'featured-movies',
        }).returning();
    }

    // Check current count
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.listId, moviesList.id));
    const currentCount = Number(countResult?.count || 0);
    console.log(`📊 Current movies: ${currentCount}`);

    if (currentCount >= 10000) {
        console.log('✅ Already at 10K!');
        process.exit(0);
    }

    const TARGET = 10000;
    const needed = TARGET - currentCount;
    console.log(`📈 Need to add: ${needed}\n`);

    // Endpoints to cycle through for variety
    const endpoints = [
        '/movie/popular',
        '/movie/top_rated',
        '/movie/now_playing',
        '/movie/upcoming',
        '/discover/movie?sort_by=vote_count.desc',
        '/discover/movie?sort_by=revenue.desc',
        '/discover/movie?sort_by=popularity.desc&with_genres=28', // Action
        '/discover/movie?sort_by=popularity.desc&with_genres=35', // Comedy
        '/discover/movie?sort_by=popularity.desc&with_genres=18', // Drama
        '/discover/movie?sort_by=popularity.desc&with_genres=27', // Horror
        '/discover/movie?sort_by=popularity.desc&with_genres=878', // Sci-Fi
        '/discover/movie?sort_by=popularity.desc&with_genres=10749', // Romance
    ];

    let added = 0;
    let endpointIndex = 0;

    while (added < needed) {
        const endpoint = endpoints[endpointIndex % endpoints.length];
        endpointIndex++;

        for (let page = 1; page <= 500 && added < needed; page++) {
            const movies = await fetchTMDB(endpoint, page);
            if (movies.length === 0) break;

            for (const m of movies) {
                if (added >= needed) break;
                try {
                    await db.insert(items).values({
                        listId: moviesList.id,
                        categoryId: moviesCategory.id,
                        externalId: `tmdb-movie-${m.id}`,
                        externalSource: 'tmdb',
                        title: m.title,
                        subtitle: m.release_date?.split('-')[0],
                        imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                        releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                        description: m.overview?.slice(0, 300),
                    });
                    added++;
                } catch { /* duplicate */ }
            }

            if (added % 500 === 0) console.log(`  📊 Added: ${added}/${needed}`);
            await new Promise(r => setTimeout(r, 260)); // Rate limit
        }
    }

    console.log(`\n✨ Done! Added ${added} movies.`);
    console.log(`📊 Total movies: ${currentCount + added}`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
