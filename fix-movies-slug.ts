/**
 * Fix the Featured Movies shareSlug
 * Run: npx tsx fix-movies-slug.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { lists } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🔧 Fixing Featured Movies shareSlug...\n');

    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Find the Featured Movies list
    const moviesList = await db
        .select()
        .from(lists)
        .where(eq(lists.name, 'Featured Movies'));

    if (moviesList.length === 0) {
        console.error('❌ Featured Movies list not found');
        process.exit(1);
    }

    console.log(`📋 Found list: ${moviesList[0].name}`);
    console.log(`   Current shareSlug: ${moviesList[0].shareSlug || 'null'}`);
    console.log(`   isPublic: ${moviesList[0].isPublic}`);

    // Update the shareSlug
    const [updated] = await db
        .update(lists)
        .set({
            shareSlug: 'featured-movies',
            isPublic: true
        })
        .where(eq(lists.id, moviesList[0].id))
        .returning();

    console.log(`\n✅ Updated!`);
    console.log(`   New shareSlug: ${updated.shareSlug}`);
    console.log(`   isPublic: ${updated.isPublic}`);

    console.log(`\n🎉 Done! Visit /share/featured-movies to verify.`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
