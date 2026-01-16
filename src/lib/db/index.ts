import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL is not set. Database operations will fail.');
}

const sql = connectionString ? neon(connectionString) : null;

export const db = sql
    ? drizzle(sql, { schema })
    : null as unknown as ReturnType<typeof drizzle<typeof schema>>;

// Helper to check if DB is available
export function isDatabaseConfigured(): boolean {
    return !!connectionString && !!sql;
}
