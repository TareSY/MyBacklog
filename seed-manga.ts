/**
 * Manga seed using Open Library
 * Run: npx tsx seed-manga.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const POPULAR_MANGA = [
    'One Piece', 'Naruto', 'Dragon Ball', 'Attack on Titan', 'Death Note',
    'Fullmetal Alchemist', 'One Punch Man', 'My Hero Academia', 'Demon Slayer',
    'Jujutsu Kaisen', 'Tokyo Ghoul', 'Hunter x Hunter', 'Bleach', 'Chainsaw Man',
    'Spy x Family', 'Blue Lock', 'Kaiju No. 8', 'Vinland Saga', 'Berserk',
    'Vagabond', 'Monster', '20th Century Boys', 'Slam Dunk', 'Haikyuu',
    'Mob Psycho 100', 'The Promised Neverland', 'Dr. Stone', 'Black Clover',
    'Fairy Tail', 'Sword Art Online', 'Mushoku Tensei', 'Re:Zero', 'Overlord',
    'Solo Leveling', 'Tower of God', 'The Beginning After the End', 'Omniscient Reader',
    'Fruits Basket', 'Sailor Moon', 'Cardcaptor Sakura', 'Ouran High School Host Club',
    'Nana', 'Banana Fish', 'Given', 'Horimiya', 'Kaguya-sama Love is War',
    'Rent-A-Girlfriend', 'Quintessential Quintuplets', 'Oshi no Ko', 'Bocchi the Rock',
    'Dandadan', 'Mashle', 'Undead Unluck', 'Sakamoto Days', 'Hell\'s Paradise',
];

async function searchManga(query: string): Promise<any[]> {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query + ' manga')}&limit=5`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.docs || [];
    } catch { return []; }
}

function getCoverUrl(coverId: number | undefined): string | null {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

async function main() {
    console.log('📚 Seeding manga from Open Library...\n');

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
        }).returning();
    }

    const [booksCategory] = await db.select().from(categories).where(eq(categories.slug, 'books'));
    if (!booksCategory) { console.error('❌ Books category not found'); process.exit(1); }

    // Create Manga list
    let [mangaList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Popular Manga')));
    if (!mangaList) {
        [mangaList] = await db.insert(lists).values({
            userId: curator.id, name: 'Popular Manga',
            description: 'Top manga series from Japan',
            isPublic: true, shareSlug: 'manga',
        }).returning();
    }

    const seenTitles = new Set<string>();
    let addedCount = 0;

    for (const manga of POPULAR_MANGA) {
        console.log(`🔍 ${manga}`);

        const results = await searchManga(manga);

        for (const book of results.slice(0, 2)) {
            if (seenTitles.has(book.title.toLowerCase())) continue;
            seenTitles.add(book.title.toLowerCase());

            try {
                await db.insert(items).values({
                    listId: mangaList.id, categoryId: booksCategory.id,
                    externalId: book.key, externalSource: 'open_library',
                    title: book.title,
                    subtitle: book.author_name?.[0] || 'Manga',
                    imageUrl: getCoverUrl(book.cover_i),
                    releaseYear: book.first_publish_year,
                    description: 'Manga series',
                });
                addedCount++;
                console.log(`  ✅ ${book.title}`);
            } catch { }
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✨ Done! Added ${addedCount} manga.`);
    console.log(`📖 View at: /share/manga`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
