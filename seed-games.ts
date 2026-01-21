/**
 * Universal Seeder Script using Strategy Pattern
 * Run: npx tsx seed-games.ts [type]
 * Default type: 'games'
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { SeederContext } from './src/lib/strategies/seeder-strategy';

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }

    const sqlClient = neon(process.env.DATABASE_URL);
    const db = drizzle(sqlClient);

    const type = process.argv[2]?.replace('--', '') || 'games';

    try {
        const context = new SeederContext();
        await context.execute(db, type);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
