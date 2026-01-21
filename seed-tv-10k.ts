/**
 * Scale TV shows to 10,000 items via TMDB
 * Run: npx tsx seed-tv-10k.ts
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
    const url = `${TMDB_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch { return []; }
}

async function main() {
    console.log('📺 Scaling TV shows to 10,000 items...\n');

    if (!TMDB_API_KEY) { console.error('❌ TMDB_API_KEY not set'); process.exit(1); }

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    const [tvCategory] = await db.select().from(categories).where(eq(categories.slug, 'tv'));
    if (!tvCategory) { console.error('❌ TV category not found'); process.exit(1); }

    let [tvList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured TV Shows')));
    if (!tvList) {
        [tvList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured TV Shows',
            description: 'Must-watch series', isPublic: true, shareSlug: 'featured-tv',
        }).returning();
    }

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.listId, tvList.id));
    const currentCount = Number(countResult?.count || 0);
    console.log(`📊 Current TV shows: ${currentCount}`);

    if (currentCount >= 10000) {
        console.log('✅ Already at 10K!');
        process.exit(0);
    }

    const TARGET = 10000;
    const needed = TARGET - currentCount;
    console.log(`📈 Need to add: ${needed}\n`);

    const endpoints = [
        '/tv/popular',
        '/tv/top_rated',
        '/tv/on_the_air',
        '/tv/airing_today',
        '/discover/tv?sort_by=popularity.desc',
        '/discover/tv?sort_by=vote_count.desc',
        '/discover/tv?with_genres=10759', // Action & Adventure
        '/discover/tv?with_genres=35', // Comedy
        '/discover/tv?with_genres=18', // Drama
        '/discover/tv?with_genres=10765', // Sci-Fi & Fantasy
        '/discover/tv?with_genres=80', // Crime
        '/discover/tv?with_genres=9648', // Mystery
    ];

    let added = 0;
    let endpointIndex = 0;

    while (added < needed) {
        const endpoint = endpoints[endpointIndex % endpoints.length];
        endpointIndex++;

        for (let page = 1; page <= 500 && added < needed; page++) {
            const shows = await fetchTMDB(endpoint, page);
            if (shows.length === 0) break;

            for (const s of shows) {
                if (added >= needed) break;
                try {
                    await db.insert(items).values({
                        listId: tvList.id,
                        categoryId: tvCategory.id,
                        externalId: `tmdb-tv-${s.id}`,
                        externalSource: 'tmdb',
                        title: s.name,
                        subtitle: s.first_air_date?.split('-')[0],
                        imageUrl: s.poster_path ? `${TMDB_IMAGE}${s.poster_path}` : null,
                        releaseYear: s.first_air_date ? parseInt(s.first_air_date.split('-')[0]) : undefined,
                        description: s.overview?.slice(0, 300),
                    });
                    added++;
                } catch { }
            }

            if (added % 500 === 0) console.log(`  📊 Added: ${added}/${needed}`);
            await new Promise(r => setTimeout(r, 260));
        }
    }

    console.log(`\n✨ Done! Added ${added} TV shows.`);
    console.log(`📊 Total TV shows: ${currentCount + added}`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
