/**
 * Fix missing movie poster URLs by re-fetching from TMDB
 * Run: npx tsx fix-posters.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { items, lists } from './src/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

async function searchTMDB(title: string): Promise<string | null> {
    try {
        const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            return `${TMDB_IMAGE}${data.results[0].poster_path}`;
        }
    } catch { }
    return null;
}

async function main() {
    console.log('🔧 Fixing missing movie poster URLs...\n');

    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY not set');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Get Featured Movies list
    const [moviesList] = await db.select().from(lists)
        .where(eq(lists.name, 'Featured Movies'));

    if (!moviesList) {
        console.error('❌ Featured Movies list not found');
        process.exit(1);
    }

    // Find items with null imageUrl
    const itemsToFix = await db.select({
        id: items.id,
        title: items.title,
    }).from(items).where(
        and(
            eq(items.listId, moviesList.id),
            isNull(items.imageUrl)
        )
    ).limit(100);

    console.log(`📋 Found ${itemsToFix.length} items without posters\n`);

    let fixed = 0;
    for (const item of itemsToFix) {
        console.log(`  🔍 Searching: ${item.title}`);
        const posterUrl = await searchTMDB(item.title);

        if (posterUrl) {
            await db.update(items)
                .set({ imageUrl: posterUrl })
                .where(eq(items.id, item.id));
            fixed++;
            console.log(`    ✅ Fixed!`);
        } else {
            console.log(`    ⚠️ No poster found`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n✨ Done! Fixed ${fixed}/${itemsToFix.length} posters.`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
