/**
 * Large-scale book seeder - fetches 1000+ books
 * Run: npx tsx seed-books-1000.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const SUBJECTS = [
    'fiction', 'science_fiction', 'fantasy', 'mystery', 'thriller', 'romance',
    'horror', 'biography', 'history', 'science', 'philosophy', 'psychology',
    'self_help', 'business', 'poetry', 'drama', 'young_adult', 'children',
    'adventure', 'crime', 'humor', 'art', 'music', 'cooking', 'travel',
    'health', 'sports', 'politics', 'religion', 'classic_literature',
    'contemporary_fiction', 'historical_fiction', 'literary_fiction',
    'war', 'espionage', 'dystopia', 'utopia', 'mythology', 'folklore',
];

interface OLWork {
    key: string;
    title: string;
    authors?: { name: string }[];
    first_publish_year?: number;
    cover_id?: number;
}

async function fetchSubject(subject: string, offset: number = 0): Promise<OLWork[]> {
    const url = `https://openlibrary.org/subjects/${subject}.json?limit=50&offset=${offset}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.works || [];
    } catch {
        return [];
    }
}

function getCoverUrl(coverId: number | undefined): string | null {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

async function main() {
    console.log('📚 Seeding 1000+ books from Open Library...\n');

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

    let [booksList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Books')));

    if (!booksList) {
        [booksList] = await db.insert(lists).values({
            userId: curator.id, name: 'Featured Books',
            description: 'Curated collection of must-read books',
            isPublic: true, shareSlug: 'featured-books',
        }).returning();
    }

    const existingItems = await db.select({ title: items.title }).from(items).where(eq(items.listId, booksList.id));
    const existingTitles = new Set(existingItems.map(i => i.title.toLowerCase()));

    let addedCount = 0;
    const TARGET = 1000;

    for (const subject of SUBJECTS) {
        if (addedCount >= TARGET) break;

        for (let offset = 0; offset < 150 && addedCount < TARGET; offset += 50) {
            console.log(`📖 ${subject} (offset ${offset}) - Total: ${addedCount}`);

            const works = await fetchSubject(subject, offset);
            if (works.length === 0) break;

            for (const work of works) {
                if (addedCount >= TARGET) break;
                if (existingTitles.has(work.title.toLowerCase())) continue;

                try {
                    await db.insert(items).values({
                        listId: booksList.id, categoryId: booksCategory.id,
                        externalId: work.key, externalSource: 'open_library',
                        title: work.title, subtitle: work.authors?.[0]?.name,
                        imageUrl: getCoverUrl(work.cover_id),
                        releaseYear: work.first_publish_year,
                        description: subject.replace(/_/g, ' '),
                    });
                    existingTitles.add(work.title.toLowerCase());
                    addedCount++;
                } catch { }
            }
            await new Promise(r => setTimeout(r, 300));
        }
    }

    console.log(`\n✨ Done! Added ${addedCount} books.`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
