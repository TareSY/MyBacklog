/**
 * Seed 1000+ games using RAWG API (free, no key required for basic access)
 * Run: npx tsx seed-games.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const RAWG_BASE = 'https://api.rawg.io/api';
// RAWG has a free tier with basic access - we'll try without a key first
// If rate limited, user can get a free key from https://rawg.io/apidocs

async function fetchRAWG(endpoint: string, page: number = 1): Promise<any[]> {
    // Try with API key if available, otherwise use basic access
    const apiKey = process.env.RAWG_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const url = `${RAWG_BASE}${endpoint}?page=${page}&page_size=40${keyParam}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`  ⚠️ RAWG API error: ${res.status}`);
            return [];
        }
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error('Fetch error:', err);
        return [];
    }
}

async function main() {
    console.log('🎮 Seeding 1000+ top games from RAWG...\n');

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    // Get or create curator user
    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    // Check if games category exists, create if not
    let [gamesCategory] = await db.select().from(categories).where(eq(categories.slug, 'games'));
    if (!gamesCategory) {
        console.log('📦 Creating Games category...');
        [gamesCategory] = await db.insert(categories).values({
            name: 'Games',
            slug: 'games',
            icon: 'gamepad',
            color: '#10B981', // Green
        }).returning();
        console.log(`  ✅ Created Games category (id: ${gamesCategory.id})\n`);
    }

    // Get or create Featured Games list
    let [gamesList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Games')));
    if (!gamesList) {
        [gamesList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Games',
            description: 'Top games across all platforms',
            isPublic: true,
            shareSlug: 'featured-games',
        }).returning();
        console.log(`📋 Created Featured Games list\n`);
    }

    // Check current count
    const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(items).where(eq(items.listId, gamesList.id));
    const currentCount = Number(countResult?.count || 0);
    console.log(`📊 Current games: ${currentCount}`);

    if (currentCount >= 1000) {
        console.log('✅ Already at 1K games!');
        process.exit(0);
    }

    const TARGET = 1000;
    const needed = TARGET - currentCount;
    console.log(`📈 Need to add: ${needed}\n`);

    // RAWG endpoints for top games
    const endpoints = [
        '/games?ordering=-rating',           // Top rated
        '/games?ordering=-metacritic',       // Top metacritic
        '/games?ordering=-added',            // Most added to collections
        '/games?ordering=-released',         // Newest releases
        '/games?dates=2020-01-01,2024-12-31&ordering=-rating', // Recent top rated
    ];

    let added = 0;
    let endpointIndex = 0;

    while (added < needed) {
        const endpoint = endpoints[endpointIndex % endpoints.length];
        endpointIndex++;

        for (let page = 1; page <= 25 && added < needed; page++) {
            console.log(`  🔍 Fetching page ${page}...`);
            const games = await fetchRAWG(endpoint, page);

            if (games.length === 0) {
                console.log('  ⚠️ No more results from this endpoint');
                break;
            }

            for (const game of games) {
                if (added >= needed) break;

                try {
                    const year = game.released ? parseInt(game.released.split('-')[0]) : undefined;
                    const platforms = game.platforms?.map((p: any) => p.platform.name).slice(0, 3).join(', ');

                    await db.insert(items).values({
                        listId: gamesList.id,
                        categoryId: gamesCategory.id,
                        externalId: `rawg-${game.id}`,
                        externalSource: 'rawg',
                        title: game.name,
                        subtitle: platforms || null,
                        imageUrl: game.background_image || null,
                        releaseYear: year,
                        description: game.genres?.map((g: any) => g.name).join(', ') || null,
                    });
                    added++;
                } catch {
                    // Duplicate or error, skip
                }
            }

            if (added % 100 === 0 && added > 0) {
                console.log(`  📊 Added: ${added}/${needed}`);
            }

            // Rate limit - be respectful to free API
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n✨ Done! Added ${added} games.`);
    console.log(`📊 Total games: ${currentCount + added}`);
    console.log(`\n🔗 View at: /share/featured-games`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
