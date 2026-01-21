/**
 * Scale music to 10,000 items via MusicBrainz
 * Run: npx tsx seed-music-10k.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const MB_USER_AGENT = 'MyBacklog/1.0 (https://thebacklog.vercel.app)';

async function fetchMusicBrainz(offset: number): Promise<any[]> {
    const url = `https://musicbrainz.org/ws/2/release?query=*&fmt=json&limit=100&offset=${offset}`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': MB_USER_AGENT }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.releases || [];
    } catch { return []; }
}

async function main() {
    console.log('🎵 Scaling music to 10,000 items...\n');

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    const [musicCategory] = await db.select().from(categories).where(eq(categories.slug, 'music'));
    if (!musicCategory) { console.error('❌ Music category not found'); process.exit(1); }

    let [musicList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Music')));
    if (!musicList) {
        [musicList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured Music',
            description: 'Must-listen albums', isPublic: true, shareSlug: 'featured-music',
        }).returning();
    }

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.listId, musicList.id));
    const currentCount = Number(countResult?.count || 0);
    console.log(`📊 Current albums: ${currentCount}`);

    if (currentCount >= 10000) {
        console.log('✅ Already at 10K!');
        process.exit(0);
    }

    const TARGET = 10000;
    const needed = TARGET - currentCount;
    console.log(`📈 Need to add: ${needed}\n`);

    let added = 0;
    let offset = 0;

    while (added < needed && offset < 100000) {
        const releases = await fetchMusicBrainz(offset);
        if (releases.length === 0) break;

        for (const release of releases) {
            if (added >= needed) break;
            const artist = release['artist-credit']?.[0]?.name;
            const year = release.date?.split('-')[0];

            try {
                await db.insert(items).values({
                    listId: musicList.id,
                    categoryId: musicCategory.id,
                    externalId: `mb-${release.id}`,
                    externalSource: 'musicbrainz',
                    title: release.title,
                    subtitle: artist,
                    imageUrl: null, // MusicBrainz doesn't provide cover art directly
                    releaseYear: year ? parseInt(year) : undefined,
                    description: null,
                });
                added++;
            } catch { }
        }

        if (added % 500 === 0) console.log(`  📊 Added: ${added}/${needed}`);
        offset += 100;
        await new Promise(r => setTimeout(r, 1100)); // MusicBrainz rate limit: 1 req/sec
    }

    console.log(`\n✨ Done! Added ${added} albums.`);
    console.log(`📊 Total albums: ${currentCount + added}`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
