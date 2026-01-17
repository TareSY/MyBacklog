/**
 * Seed script to populate the database with popular books from Open Library
 * Run: npx tsx seed-books.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const OPEN_LIBRARY_API = 'https://openlibrary.org';

interface OpenLibraryBook {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    subject?: string[];
}

interface OpenLibrarySearchResponse {
    docs: OpenLibraryBook[];
}

async function searchBooks(query: string): Promise<OpenLibraryBook[]> {
    const url = `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url);
    const data: OpenLibrarySearchResponse = await res.json();
    return data.docs;
}

function getCoverUrl(coverId: number | undefined): string | null {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

async function main() {
    console.log('📚 Seeding popular books from Open Library...\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not set in .env');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Find Curator user
    let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));

    if (!curator) {
        console.log('Creating Curator user...');
        [curator] = await db.insert(users).values({
            email: 'curator@mybacklog.app',
            name: 'Curator',
            username: 'curator',
        }).returning();
    }

    // Get books category
    const [booksCategory] = await db.select().from(categories).where(eq(categories.slug, 'books'));

    if (!booksCategory) {
        console.error('❌ Books category not found. Please seed categories first.');
        process.exit(1);
    }

    // Find or create Featured Books list with share slug
    let [booksList] = await db
        .select()
        .from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Books')));

    if (!booksList) {
        console.log('Creating Featured Books list...');
        [booksList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Books',
            description: 'Must-read classic and popular books curated by the community',
            isPublic: true,
            shareSlug: 'featured-books',
        }).returning();
    } else if (!booksList.shareSlug) {
        // Update existing list with shareSlug
        await db.update(lists).set({ shareSlug: 'featured-books', isPublic: true }).where(eq(lists.id, booksList.id));
    }

    // Popular book queries
    const bookQueries = [
        'Harry Potter Sorcerer Stone',
        '1984 George Orwell',
        'To Kill a Mockingbird Harper Lee',
        'The Great Gatsby Fitzgerald',
        'Pride and Prejudice Jane Austen',
        'The Hobbit Tolkien',
        'The Catcher in the Rye Salinger',
        'Lord of the Rings Fellowship',
        'The Alchemist Paulo Coelho',
        'Brave New World Huxley',
        'The Little Prince Saint-Exupery',
        'Crime and Punishment Dostoevsky',
        'One Hundred Years of Solitude Marquez',
        'The Da Vinci Code Dan Brown',
        'The Hunger Games Suzanne Collins',
        'Gone Girl Gillian Flynn',
        'The Kite Runner Khaled Hosseini',
        'Sapiens Yuval Noah',
        'Atomic Habits James Clear',
        'Thinking Fast and Slow Kahneman',
    ];

    let addedCount = 0;

    for (const query of bookQueries) {
        console.log(`🔍 Searching: ${query}`);

        try {
            const books = await searchBooks(query);

            if (books.length > 0) {
                const book = books[0];

                // Check if already exists by title
                const [existing] = await db
                    .select()
                    .from(items)
                    .where(and(eq(items.listId, booksList.id), eq(items.title, book.title)));

                if (!existing) {
                    await db.insert(items).values({
                        listId: booksList.id,
                        categoryId: booksCategory.id,
                        externalId: book.key,
                        externalSource: 'open_library',
                        title: book.title,
                        subtitle: book.author_name?.[0] || undefined,
                        imageUrl: getCoverUrl(book.cover_i),
                        releaseYear: book.first_publish_year,
                        description: book.subject?.slice(0, 5).join(', ') || undefined,
                    });

                    console.log(`  ✅ Added: ${book.title} by ${book.author_name?.[0] || 'Unknown'}`);
                    addedCount++;
                } else {
                    console.log(`  ⏭️ Skipped (exists): ${book.title}`);
                }
            } else {
                console.log(`  ⚠️ No results found`);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`  ❌ Error:`, error);
        }
    }

    console.log(`\n✨ Done! Added ${addedCount} books to Featured Books list.`);
    console.log(`📖 View at: /share/featured-books`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
