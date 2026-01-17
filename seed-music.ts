/**
 * Seed script for music albums using MusicBrainz API
 * Run: npx tsx seed-music.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// MusicBrainz requires User-Agent header
const MB_HEADERS = {
    'User-Agent': 'MyBacklog/1.0 (https://thebacklog.vercel.app)',
    'Accept': 'application/json',
};

interface MBRelease {
    id: string;
    title: string;
    date?: string;
    'artist-credit'?: { name: string }[];
}

interface MBSearchResponse {
    releases: MBRelease[];
}

// Popular artists to seed from
const POPULAR_ARTISTS = [
    'Taylor Swift', 'The Beatles', 'Pink Floyd', 'Queen', 'Radiohead',
    'Kendrick Lamar', 'Daft Punk', 'Adele', 'Beyoncé', 'Drake',
    'Coldplay', 'Ed Sheeran', 'The Weeknd', 'Billie Eilish', 'Bruno Mars',
    'Fleetwood Mac', 'Led Zeppelin', 'Nirvana', 'Michael Jackson', 'Prince',
    'David Bowie', 'Kanye West', 'Arctic Monkeys', 'Frank Ocean', 'SZA',
];

async function searchAlbums(artist: string): Promise<MBRelease[]> {
    const url = `https://musicbrainz.org/ws/2/release?query=artist:"${encodeURIComponent(artist)}"&limit=5&fmt=json`;

    try {
        const res = await fetch(url, { headers: MB_HEADERS });
        if (!res.ok) return [];
        const data: MBSearchResponse = await res.json();
        return data.releases || [];
    } catch {
        return [];
    }
}

async function main() {
    console.log('🎵 Seeding music albums from MusicBrainz...\n');

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

    // Get music category
    const [musicCategory] = await db.select().from(categories).where(eq(categories.slug, 'music'));
    if (!musicCategory) {
        console.error('❌ Music category not found');
        process.exit(1);
    }

    // Create Featured Music list
    let [musicList] = await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Music')));

    if (!musicList) {
        [musicList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Music',
            description: 'Essential albums across all genres',
            isPublic: true,
            shareSlug: 'featured-music',
        }).returning();
    }

    let addedCount = 0;
    const seenTitles = new Set<string>();

    for (const artist of POPULAR_ARTISTS) {
        console.log(`🔍 Searching: ${artist}`);

        const albums = await searchAlbums(artist);

        for (const album of albums) {
            const key = `${album.title.toLowerCase()}-${artist.toLowerCase()}`;
            if (seenTitles.has(key)) continue;
            seenTitles.add(key);

            const year = album.date?.split('-')[0];
            const artistName = album['artist-credit']?.[0]?.name || artist;

            try {
                await db.insert(items).values({
                    listId: musicList.id,
                    categoryId: musicCategory.id,
                    externalId: `mb-${album.id}`,
                    externalSource: 'musicbrainz',
                    title: album.title,
                    subtitle: artistName,
                    releaseYear: year ? parseInt(year) : undefined,
                    description: `Album by ${artistName}`,
                });
                addedCount++;
                console.log(`  ✅ ${album.title} - ${artistName}`);
            } catch {
                // Skip duplicates
            }
        }

        // MusicBrainz rate limit: 1 req/sec
        await new Promise(r => setTimeout(r, 1100));
    }

    console.log(`\n✨ Done!`);
    console.log(`   🎵 Albums added: ${addedCount}`);
    console.log(`   📖 View at: /share/featured-music`);
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
