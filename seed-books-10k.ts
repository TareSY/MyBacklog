/**
 * Scale books to 10,000 items via Open Library
 * Run: npx tsx seed-books-10k.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const OPEN_LIBRARY_SUBJECTS = [
    'fiction', 'nonfiction', 'fantasy', 'science_fiction', 'mystery',
    'romance', 'thriller', 'horror', 'biography', 'history',
    'philosophy', 'psychology', 'self_help', 'business', 'economics',
    'politics', 'science', 'technology', 'art', 'music',
    'cooking', 'travel', 'health', 'religion', 'poetry',
    'drama', 'adventure', 'children', 'young_adult', 'classics',
    'contemporary', 'literary_fiction', 'historical_fiction', 'true_crime', 'memoir'
];

async function fetchOpenLibrary(subject: string, page: number): Promise<any[]> {
    const offset = (page - 1) * 50;
    const url = `https://openlibrary.org/subjects/${subject}.json?limit=50&offset=${offset}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.works || [];
    } catch { return []; }
}

async function main() {
    console.log('📚 Scaling books to 10,000 items...\n');

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

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
            description: 'Must-read books', isPublic: true, shareSlug: 'featured-books',
        }).returning();
    }

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.listId, booksList.id));
    const currentCount = Number(countResult?.count || 0);
    console.log(`📊 Current books: ${currentCount}`);

    if (currentCount >= 10000) {
        console.log('✅ Already at 10K!');
        process.exit(0);
    }

    const TARGET = 10000;
    const needed = TARGET - currentCount;
    console.log(`📈 Need to add: ${needed}\n`);

    let added = 0;
    for (const subject of OPEN_LIBRARY_SUBJECTS) {
        if (added >= needed) break;
        console.log(`  📖 Subject: ${subject}`);

        for (let page = 1; page <= 20 && added < needed; page++) {
            const books = await fetchOpenLibrary(subject, page);
            if (books.length === 0) break;

            for (const book of books) {
                if (added >= needed) break;
                const author = book.authors?.[0]?.name;
                const coverId = book.cover_id;
                const year = book.first_publish_year;

                try {
                    await db.insert(items).values({
                        listId: booksList.id,
                        categoryId: booksCategory.id,
                        externalId: `ol-${book.key}`,
                        externalSource: 'openlibrary',
                        title: book.title,
                        subtitle: author,
                        imageUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
                        releaseYear: year,
                        description: book.description?.slice?.(0, 300) || null,
                    });
                    added++;
                } catch { }
            }

            if (added % 500 === 0) console.log(`    📊 Added: ${added}/${needed}`);
            await new Promise(r => setTimeout(r, 500)); // Rate limit
        }
    }

    console.log(`\n✨ Done! Added ${added} books.`);
    console.log(`📊 Total books: ${currentCount + added}`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
