/**
 * Seed specific books requested by user
 * Run: npx tsx seed-user-books.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items, categories } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const BOOKS = [
    { title: "Take a Hint, Dani Brown", author: "Talia Hibbert" },
    { title: "Solve for Happy", author: "Mo Gawdat" },
    { title: "The State of Affairs", author: "Esther Perel" },
    { title: "American Dirt", author: "Jeanine Cummins" },
    { title: "Crime and Punishment", author: "Fyodor Dostoevsky" },
    { title: "Jane Eyre", author: "Charlotte Brontë" },
    { title: "Becoming", author: "Michelle Obama" },
    { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez" },
    { title: "Rejection Proof", author: "Jia Jiang" },
    { title: "Unrestricted Warfare", author: "Qiao Liang and Wang Xiangsui" },
    { title: "Lies My Teacher Told Me", author: "James W. Loewen" },
    { title: "I Could Do Anything if I Only Knew What It Was", author: "Barbara Sher and Barbara Smith" },
    { title: "Permanent Record", author: "Edward Snowden" },
    { title: "Date-onomics", author: "Jon Birger" },
    { title: "Land of Big Numbers", author: "Te-Ping Chen" },
    { title: "Why Do So Many Incompetent Men Become Leaders?", author: "Tomas Chamorro-Premuzic" },
    { title: "Invisible Women", author: "Caroline Criado Perez" },
];

const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b/olid';

async function searchOpenLibrary(title: string, author: string): Promise<{ coverUrl: string | null; year: number | null; description: string | null }> {
    try {
        const query = encodeURIComponent(`${title} ${author}`);
        const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
        if (!res.ok) return { coverUrl: null, year: null, description: null };

        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
            const book = data.docs[0];
            const coverId = book.cover_edition_key || book.edition_key?.[0];
            return {
                coverUrl: coverId ? `${OPEN_LIBRARY_COVERS}/${coverId}-M.jpg` : null,
                year: book.first_publish_year || null,
                description: null,
            };
        }
    } catch (e) {
        console.error(`  ⚠️ Failed to fetch: ${title}`);
    }
    return { coverUrl: null, year: null, description: null };
}

async function main() {
    console.log('📚 Seeding user-requested books...\n');

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Get or create curator user
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

    // Get or create featured books list
    let [booksList] = await db.select().from(lists)
        .where(and(eq(lists.userId, curator.id), eq(lists.name, 'Featured Books')));
    if (!booksList) {
        [booksList] = await db.insert(lists).values({
            userId: curator.id,
            name: 'Featured Books',
            description: 'Must-read books',
            isPublic: true,
            shareSlug: 'featured-books',
        }).returning();
    }

    let added = 0;
    for (const book of BOOKS) {
        console.log(`  📖 Adding: ${book.title}`);
        const info = await searchOpenLibrary(book.title, book.author);

        try {
            await db.insert(items).values({
                listId: booksList.id,
                categoryId: booksCategory.id,
                externalId: `user-book-${book.title.toLowerCase().replace(/\s+/g, '-')}`,
                externalSource: 'user',
                title: book.title,
                subtitle: book.author,
                imageUrl: info.coverUrl,
                releaseYear: info.year,
                description: info.description,
            });
            added++;
        } catch (e) {
            console.log(`  ⚠️ Already exists or error: ${book.title}`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n✨ Done! Added ${added} books.`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
