/**
 * Check and fix movie poster URLs in database
 * Run: npx tsx check-posters.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { items, lists } from './src/lib/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';

async function main() {
    console.log('🔍 Checking movie poster URLs...\n');

    const sqlClient = neon(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    // Get Featured Movies list
    const [moviesList] = await db.select().from(lists)
        .where(eq(lists.name, 'Featured Movies'));

    if (!moviesList) {
        console.error('❌ Featured Movies list not found');
        process.exit(1);
    }

    console.log(`📋 List: ${moviesList.name} (ID: ${moviesList.id})`);

    // Count items with and without imageUrl
    const allItems = await db.select({
        id: items.id,
        title: items.title,
        imageUrl: items.imageUrl,
        externalId: items.externalId,
    }).from(items).where(eq(items.listId, moviesList.id)).limit(20);

    const totalCount = allItems.length;
    const withImage = allItems.filter(i => i.imageUrl).length;
    const withoutImage = allItems.filter(i => !i.imageUrl).length;

    console.log(`\n📊 Stats (sample of 20):`);
    console.log(`   Total: ${totalCount}`);
    console.log(`   With imageUrl: ${withImage}`);
    console.log(`   Without imageUrl: ${withoutImage}`);

    console.log(`\n📸 Sample items with imageUrl:`);
    allItems.filter(i => i.imageUrl).slice(0, 3).forEach(i => {
        console.log(`   - ${i.title}: ${i.imageUrl?.slice(0, 60)}...`);
    });

    console.log(`\n❌ Sample items without imageUrl:`);
    allItems.filter(i => !i.imageUrl).slice(0, 3).forEach(i => {
        console.log(`   - ${i.title} (${i.externalId})`);
    });

    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
