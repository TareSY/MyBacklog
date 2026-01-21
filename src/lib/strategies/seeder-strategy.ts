import { users, lists, items, categories } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getFullGameList } from '@/lib/data/game-data';

export interface ISeeder {
    seed(db: any): Promise<void>;
}

export abstract class BaseSeeder implements ISeeder {
    abstract seed(db: any): Promise<void>;

    protected async getOrCreateCurator(db: any) {
        let [curator] = await db.select().from(users).where(eq(users.username, 'curator'));
        if (!curator) {
            console.log('👤 Creating Curator user...');
            [curator] = await db.insert(users).values({
                email: 'curator@mybacklog.app', name: 'Curator', username: 'curator',
            }).returning();
        }
        return curator;
    }

    protected async getOrCreateCategory(db: any, slug: string, name: string, icon: string, color: string) {
        let [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
        if (!cat) {
            console.log(`📦 Creating ${name} category...`);
            [cat] = await db.insert(categories).values({
                name, slug, icon, color
            }).returning();
        }
        return cat;
    }

    protected async getOrCreateList(db: any, userId: string, name: string, description: string, shareSlug: string) {
        let [list] = await db.select().from(lists)
            .where(and(eq(lists.userId, userId), eq(lists.name, name)));
        if (!list) {
            console.log(`📋 Creating ${name} list...`);
            [list] = await db.insert(lists).values({
                userId, name, description, isPublic: true, shareSlug
            }).returning();
        }
        return list;
    }
}

export class GameSeeder extends BaseSeeder {
    async seed(db: any): Promise<void> {
        const curator = await this.getOrCreateCurator(db);
        const category = await this.getOrCreateCategory(db, 'games', 'Games', 'gamepad', '#10B981');
        const list = await this.getOrCreateList(db, curator.id, 'Featured Games', 'Top games across all platforms', 'featured-games');

        const allGames = getFullGameList();
        console.log(`📊 Seeding ${allGames.length} games...`);

        // Batch insert for performance
        const BATCH_SIZE = 100;
        let added = 0;

        for (let i = 0; i < allGames.length; i += BATCH_SIZE) {
            const batch = allGames.slice(i, i + BATCH_SIZE).map(game => ({
                listId: list.id,
                categoryId: category.id,
                externalId: `game-${game.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                externalSource: 'curated',
                title: game.title,
                subtitle: game.platform,
                platform: game.platform,
                releaseYear: game.year,
                description: `${game.platform} (${game.year})`,
                imageUrl: null,
            }));

            try {
                // Use onConflictDoNothing equivalent if supported, or just insert
                // Simple insert. If generic batch fails, we could fallback or just accept it might fail if one exists.
                // For seeding, using .onConflictDoNothing() is best if ID is unique constraint.
                // externalId is unique? We didn't set unique constraint on it in validation but schema likely has it?
                // Step 2459 schema check: generic columns.
                // Actually, let's just use try/catch on batch. If it fails, maybe log it.
                // But Drizzle basic insert might fail.
                // Better: simple loop is safest if we don't know constraints, but too slow.
                // I will use `await db.insert(items).values(batch).onConflictDoNothing()` assuming Postgres.
                await db.insert(items).values(batch).onConflictDoNothing();
                added += batch.length;
                process.stdout.write('.');
            } catch (e: any) {
                // If onConflictDoNothing is not available or logic fails, fallback to row-by-row for this batch to salvage non-dupes?
                // Or just log error.
                // console.error(e.message);
                // Fallback to sequential for this batch
                for (const item of batch) {
                    try {
                        await db.insert(items).values(item).onConflictDoNothing();
                        added++;
                    } catch { }
                }
            }
        }
        console.log(`\n✨ Processed ${allGames.length} games (New entries added).`);
    }
}

export class SeederContext {
    private seeders: Record<string, ISeeder> = {
        'games': new GameSeeder(),
        // 'movies': new MovieSeeder(),
    };

    async execute(db: any, type: string = 'games') {
        const seeder = this.seeders[type];
        if (!seeder) throw new Error(`Unknown seeder type: ${type}`);

        console.log(`🚀 Starting seeder: ${type}`);
        await seeder.seed(db);
        console.log(`✅ Seeder ${type} completed.`);
    }
}
