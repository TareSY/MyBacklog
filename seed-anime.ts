/**
 * Anime and international movies seed using TMDB
 * Run: npx tsx seed-anime.ts
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
    const url = `${TMDB_BASE}${endpoint}&page=${page}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch { return []; }
}

async function main() {
    console.log('🎌 Seeding anime and international movies...\n');

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
    if (!moviesCategory) { console.error('❌ Movies category not found'); process.exit(1); }

    // Create Anime Movies list
    let [animeList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Anime Movies')));
    if (!animeList) {
        [animeList] = await db.insert(lists).values({
            userId: curator.id, name: 'Anime Movies',
            description: 'Top anime films from Japan and beyond',
            isPublic: true, shareSlug: 'anime-movies',
        }).returning();
    }

    // Create International Films list
    let [intlList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'International Films')));
    if (!intlList) {
        [intlList] = await db.insert(lists).values({
            userId: curator.id, name: 'International Films',
            description: 'Cinema from around the world - Korean, Indian, European & more',
            isPublic: true, shareSlug: 'international-films',
        }).returning();
    }

    let animeAdded = 0, intlAdded = 0;

    // Fetch anime movies (genre 16 = Animation, origin_country = JP)
    console.log('🎌 Fetching anime movies...');
    for (let page = 1; page <= 20; page++) {
        const movies = await fetchTMDB(
            `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
            page
        );
        if (movies.length === 0) break;

        for (const m of movies) {
            try {
                await db.insert(items).values({
                    listId: animeList.id, categoryId: moviesCategory.id,
                    externalId: `tmdb-anime-${m.id}`, externalSource: 'tmdb',
                    title: m.title, subtitle: m.release_date?.split('-')[0],
                    imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                    description: m.overview?.slice(0, 300),
                });
                animeAdded++;
            } catch { }
        }
        console.log(`  📊 Anime: ${animeAdded}`);
        await new Promise(r => setTimeout(r, 260));
    }

    // Fetch Korean movies
    console.log('\n🇰🇷 Fetching Korean movies...');
    for (let page = 1; page <= 10; page++) {
        const movies = await fetchTMDB(
            `/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ko&sort_by=popularity.desc`,
            page
        );
        for (const m of movies) {
            try {
                await db.insert(items).values({
                    listId: intlList.id, categoryId: moviesCategory.id,
                    externalId: `tmdb-kr-${m.id}`, externalSource: 'tmdb',
                    title: m.title, subtitle: `Korean • ${m.release_date?.split('-')[0]}`,
                    imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                    description: m.overview?.slice(0, 300),
                });
                intlAdded++;
            } catch { }
        }
        await new Promise(r => setTimeout(r, 260));
    }

    // Fetch Indian/Bollywood movies
    console.log('🇮🇳 Fetching Indian movies...');
    for (let page = 1; page <= 10; page++) {
        const movies = await fetchTMDB(
            `/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc`,
            page
        );
        for (const m of movies) {
            try {
                await db.insert(items).values({
                    listId: intlList.id, categoryId: moviesCategory.id,
                    externalId: `tmdb-in-${m.id}`, externalSource: 'tmdb',
                    title: m.title, subtitle: `Hindi • ${m.release_date?.split('-')[0]}`,
                    imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                    description: m.overview?.slice(0, 300),
                });
                intlAdded++;
            } catch { }
        }
        await new Promise(r => setTimeout(r, 260));
    }

    // Fetch French movies
    console.log('🇫🇷 Fetching French movies...');
    for (let page = 1; page <= 5; page++) {
        const movies = await fetchTMDB(
            `/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=fr&sort_by=popularity.desc`,
            page
        );
        for (const m of movies) {
            try {
                await db.insert(items).values({
                    listId: intlList.id, categoryId: moviesCategory.id,
                    externalId: `tmdb-fr-${m.id}`, externalSource: 'tmdb',
                    title: m.title, subtitle: `French • ${m.release_date?.split('-')[0]}`,
                    imageUrl: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
                    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : undefined,
                    description: m.overview?.slice(0, 300),
                });
                intlAdded++;
            } catch { }
        }
        await new Promise(r => setTimeout(r, 260));
    }

    console.log(`\n✨ Done!`);
    console.log(`  🎌 Anime movies: ${animeAdded}`);
    console.log(`  🌍 International films: ${intlAdded}`);
    console.log(`  📖 View at: /share/anime-movies and /share/international-films`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
