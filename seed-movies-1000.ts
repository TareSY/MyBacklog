/**
 * Large-scale movie/TV seeder - fetches 1000+ each
 * Run: npx tsx seed-movies-1000.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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
    console.log('🎬 Seeding 1000+ movies and TV shows from TMDB...\n');

    if (!TMDB_API_KEY) { console.error('❌ TMDB_API_KEY not set'); process.exit(1); }

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    const [moviesCategory] = await db.select().from(categories).where(eq(categories.slug, 'movies'));
    const [tvCategory] = await db.select().from(categories).where(eq(categories.slug, 'tv'));
    if (!moviesCategory || !tvCategory) { console.error('❌ Categories not found'); process.exit(1); }

    // Get or create lists
    let [moviesList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Movies')));
    if (!moviesList) {
        [moviesList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured Movies',
            description: 'Must-watch films', isPublic: true, shareSlug: 'featured-movies',
        }).returning();
    }

    let [tvList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured TV Shows')));
    if (!tvList) {
        [tvList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured TV Shows',
            description: 'Must-watch series', isPublic: true, shareSlug: 'featured-tv',
        }).returning();
    }

    const movieEndpoints = ['/movie/popular', '/movie/top_rated', '/movie/now_playing', '/movie/upcoming'];
    const tvEndpoints = ['/tv/popular', '/tv/top_rated', '/tv/on_the_air', '/tv/airing_today'];

    let moviesAdded = 0, tvAdded = 0;
    const TARGET = 1000;

    // Seed movies - 50 pages per endpoint = ~1000 movies
    console.log('🎥 Fetching movies...');
    for (const endpoint of movieEndpoints) {
        for (let page = 1; page <= 50 && moviesAdded < TARGET; page++) {
            const movies = await fetchTMDB(endpoint, page);
            if (movies.length === 0) break;

            for (const m of movies) {
                if (moviesAdded >= TARGET) break;
                try {
                    await db.insert(items).values({
                        listId: moviesList.id, categoryId: moviesCategory.id,
                        externalId: `tmdb-movie-${m.id}`, externalSource: 'tmdb',
                        title: m.title, subtitle: m.release_date?.split('-')[0],
                        imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                        releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                        description: m.overview?.slice(0, 300),
                    });
                    moviesAdded++;
                } catch { }
            }

            if (moviesAdded % 100 === 0) console.log(`  📊 Movies: ${moviesAdded}`);
            await new Promise(r => setTimeout(r, 260)); // Rate limit: 40 req/10s
        }
    }

    // Seed TV shows
    console.log('\n📺 Fetching TV shows...');
    for (const endpoint of tvEndpoints) {
        for (let page = 1; page <= 50 && tvAdded < TARGET; page++) {
            const shows = await fetchTMDB(endpoint, page);
            if (shows.length === 0) break;

            for (const s of shows) {
                if (tvAdded >= TARGET) break;
                try {
                    await db.insert(items).values({
                        listId: tvList.id, categoryId: tvCategory.id,
                        externalId: `tmdb-tv-${s.id}`, externalSource: 'tmdb',
                        title: s.name, subtitle: s.first_air_date?.split('-')[0],
                        imageUrl: s.poster_path ? `${TMDB_IMAGE}${s.poster_path}` : null,
                        releaseYear: s.first_air_date ? parseInt(s.first_air_date.split('-')[0]) : undefined,
                        description: s.overview?.slice(0, 300),
                    });
                    tvAdded++;
                } catch { }
            }

            if (tvAdded % 100 === 0) console.log(`  📊 TV Shows: ${tvAdded}`);
            await new Promise(r => setTimeout(r, 260));
        }
    }

    console.log(`\n✨ Done!`);
    console.log(`  🎥 Movies: ${moviesAdded}`);
    console.log(`  📺 TV Shows: ${tvAdded}`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
