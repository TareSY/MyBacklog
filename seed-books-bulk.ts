/**
 * Efficient bulk book seeder using Open Library subjects
 * Run: npx tsx seed-books-bulk.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const SUBJECTS = [
    'classic_literature',
    'science_fiction',
    'fantasy',
    'mystery',
    'thriller',
    'romance',
    'biography',
    'history',
    'self_help',
    'business',
    'psychology',
    'philosophy',
    'horror',
    'young_adult',
    'children',
    'poetry',
];

interface OLWork {
    key: string;
    title: string;
    authors?: { name: string }[];
    first_publish_year?: number;
    cover_id?: number;
}

interface OLSubjectResponse {
    works: OLWork[];
}

async function fetchSubject(subject: string): Promise<OLWork[]> {
    const url = `https://openlibrary.org/subjects/${subject}.json?limit=30`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data: OLSubjectResponse = await res.json();
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
    console.log('📚 Bulk seeding books from Open Library subjects...\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not set');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get or create curator
    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
    if (!curator) {
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app',
            name: 'Curator',
            username: 'curator',
        }).returning();
    }

    // Get books category
    const [booksCategory] = await db.select().from(categories).where(eq(categories.slug, 'books'));
    if (!booksCategory) {
        console.error('❌ Books category not found');
        process.exit(1);
    }

    // Get or create Featured Books list
    let [booksList] = await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Books')));

    if (!booksList) {
        [booksList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Books',
            description: 'A curated collection of must-read books across all genres',
            isPublic: true,
            shareSlug: 'featured-books',
        }).returning();
    }

    // Get existing titles to avoid duplicates
    const existingItems = await db.select({ title: items.title }).from(items).where(eq(items.listId, booksList.id));
    const existingTitles = new Set(existingItems.map(i => i.title.toLowerCase()));

    let addedCount = 0;
    let skippedCount = 0;

    for (const subject of SUBJECTS) {
        console.log(`\n📖 Fetching: ${subject.replace(/_/g, ' ')}`);

        const works = await fetchSubject(subject);
        console.log(`   Found ${works.length} books`);

        for (const work of works) {
            if (existingTitles.has(work.title.toLowerCase())) {
                skippedCount++;
                continue;
            }

            try {
                await db.insert(items).values({
                    listId: booksList.id,
                    categoryId: booksCategory.id,
                    externalId: work.key,
                    externalSource: 'open_library',
                    title: work.title,
                    subtitle: work.authors?.[0]?.name || undefined,
                    imageUrl: getCoverUrl(work.cover_id),
                    releaseYear: work.first_publish_year,
                    description: subject.replace(/_/g, ' '),
                });

                existingTitles.add(work.title.toLowerCase());
                addedCount++;

                if (addedCount % 50 === 0) {
                    console.log(`   📊 Progress: ${addedCount} books added`);
                }
            } catch (error) {
                // Skip duplicates
            }
        }

        // Small delay between subjects
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✨ Done!`);
    console.log(`   ✅ Added: ${addedCount} new books`);
    console.log(`   ⏭️ Skipped: ${skippedCount} duplicates`);
    console.log(`   📖 View at: /share/featured-books`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
