/**
 * Large-scale music seeder - fetches 1000+ albums
 * Run: npx tsx seed-music-1000.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const MB_HEADERS = {
    'User-Agent': 'MyBacklog/1.0 (https://thebacklog.vercel.app)',
    'Accept': 'application/json',
};

// More artists to get more albums
const ARTISTS = [
    'Taylor Swift', 'The Beatles', 'Pink Floyd', 'Queen', 'Radiohead', 'Kendrick Lamar',
    'Daft Punk', 'Adele', 'Beyoncé', 'Drake', 'Coldplay', 'Ed Sheeran', 'The Weeknd',
    'Billie Eilish', 'Bruno Mars', 'Fleetwood Mac', 'Led Zeppelin', 'Nirvana',
    'Michael Jackson', 'Prince', 'David Bowie', 'Kanye West', 'Arctic Monkeys',
    'Frank Ocean', 'SZA', 'Tyler the Creator', 'Travis Scott', 'Post Malone',
    'Ariana Grande', 'Lady Gaga', 'Rihanna', 'Justin Bieber', 'Dua Lipa',
    'The Rolling Stones', 'U2', 'Metallica', 'AC/DC', 'Guns N Roses', 'Bon Jovi',
    'Eminem', 'Jay-Z', 'Nas', 'OutKast', 'A Tribe Called Quest', 'Wu-Tang Clan',
    'Bob Dylan', 'The Who', 'The Doors', 'Jimi Hendrix', 'Bob Marley', 'Stevie Wonder',
    'Whitney Houston', 'Mariah Carey', 'Celine Dion', 'Madonna', 'Janet Jackson',
    'Elton John', 'Billy Joel', 'Bruce Springsteen', 'Tom Petty', 'Eagles',
    'Red Hot Chili Peppers', 'Foo Fighters', 'Green Day', 'Blink-182', 'Linkin Park',
    'Paramore', 'Fall Out Boy', 'My Chemical Romance', 'Panic at the Disco',
    'Imagine Dragons', 'OneRepublic', 'Maroon 5', 'The 1975', 'Tame Impala',
    'Mac Miller', 'Juice WRLD', 'XXXTentacion', 'Lil Uzi Vert', 'Playboi Carti',
    'Bad Bunny', 'J Balvin', 'Daddy Yankee', 'Shakira', 'Luis Fonsi',
    'BTS', 'BLACKPINK', 'Stray Kids', 'NCT', 'TWICE', 'EXO',
    'Doja Cat', 'Megan Thee Stallion', 'Cardi B', 'Nicki Minaj', 'Lil Nas X',
    'Harry Styles', 'Zayn', 'Louis Tomlinson', 'Liam Payne', 'Niall Horan',
    'Lorde', 'Florence and the Machine', 'Hozier', 'Lana Del Rey', 'Mitski',
    'Vampire Weekend', 'Glass Animals', 'alt-J', 'MGMT', 'Arcade Fire',
];

async function searchAlbums(artist: string, offset: number = 0): Promise<any[]> {
    const url = `https://musicbrainz.org/ws/2/release?query=artist:"${encodeURIComponent(artist)}"&limit=25&offset=${offset}&fmt=json`;
    try {
        const res = await fetch(url, { headers: MB_HEADERS });
        if (!res.ok) return [];
        const data = await res.json();
        return data.releases || [];
    } catch { return []; }
}

async function main() {
    console.log('🎵 Seeding 1000+ music albums from MusicBrainz...\n');

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

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
            description: 'Essential albums across all genres',
            isPublic: true, shareSlug: 'featured-music',
        }).returning();
    }

    let addedCount = 0;
    const TARGET = 1000;
    const seenTitles = new Set<string>();

    for (const artist of ARTISTS) {
        if (addedCount >= TARGET) break;

        console.log(`🔍 ${artist} - Total: ${addedCount}`);

        // Get multiple pages per artist
        for (let offset = 0; offset < 75 && addedCount < TARGET; offset += 25) {
            const albums = await searchAlbums(artist, offset);
            if (albums.length === 0) break;

            for (const album of albums) {
                if (addedCount >= TARGET) break;

                const key = `${album.title.toLowerCase()}-${artist.toLowerCase()}`;
                if (seenTitles.has(key)) continue;
                seenTitles.add(key);

                const year = album.date?.split('-')[0];
                const artistName = album['artist-credit']?.[0]?.name || artist;

                try {
                    await db.insert(items).values({
                        listId: musicList.id, categoryId: musicCategory.id,
                        externalId: `mb-${album.id}`, externalSource: 'musicbrainz',
                        title: album.title, subtitle: artistName,
                        releaseYear: year ? parseInt(year) : undefined,
                        description: `Album by ${artistName}`,
                    });
                    addedCount++;
                } catch { }
            }

            // MusicBrainz rate limit: 1 req/sec
            await new Promise(r => setTimeout(r, 1100));
        }
    }

    console.log(`\n✨ Done! Added ${addedCount} albums.`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
