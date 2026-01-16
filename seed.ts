import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories } from './src/lib/db/schema';

async function seed() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('Seeding categories...');

    await db.insert(categories).values([
        { name: 'Movies', slug: 'movies', icon: 'Film', color: 'text-movies' },
        { name: 'TV Shows', slug: 'tv', icon: 'Tv', color: 'text-tv' },
        { name: 'Books', slug: 'books', icon: 'BookOpen', color: 'text-books' },
        { name: 'Music', slug: 'music', icon: 'Music', color: 'text-music' },
    ]).onConflictDoNothing();

    console.log('✅ Categories seeded!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
