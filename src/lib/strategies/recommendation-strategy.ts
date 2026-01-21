import { db } from '@/lib/db';
import { items, lists, categories } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export interface RecommendationItem {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    releaseYear: number | null;
    categoryId: number;
    reason: string;
}

export interface IRecommendationStrategy {
    getRecommendations(userId: string, limit: number): Promise<RecommendationItem[]>;
}

export class ContentBasedStrategy implements IRecommendationStrategy {
    async getRecommendations(userId: string, limit: number): Promise<RecommendationItem[]> {
        // 1. Get user's interests (categories of items they have)
        const userLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.userId, userId));
        const userListIds = userLists.map(l => l.id);
        if (userListIds.length === 0) return [];

        const userItems = await db
            .select({ title: items.title, categoryId: items.categoryId })
            .from(items)
            .where(inArray(items.listId, userListIds));

        const userItemTitles = new Set(userItems.map(i => i.title.toLowerCase()));
        const userCategories = [...new Set(userItems.map(i => i.categoryId))];

        if (userCategories.length === 0) return [];

        // 2. Get Public List IDs
        const publicLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.isPublic, true));
        const publicListIds = publicLists.map(l => l.id);
        if (publicListIds.length === 0) return [];

        // 3. Find items in those categories from public lists
        // Note: Ideally more complex similarity, but random pick from same category is a simple "Content-Based" approach
        const candidates = await db
            .select({
                id: items.id,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                categoryId: items.categoryId,
            })
            .from(items)
            .where(inArray(items.listId, publicListIds))
            .orderBy(sql`RANDOM()`)
            .limit(limit * 3); // Fetch more to filter

        return candidates
            .filter(i =>
                userCategories.includes(i.categoryId) &&
                !userItemTitles.has(i.title.toLowerCase())
            )
            .slice(0, limit)
            .map(i => ({
                ...i,
                reason: 'Based on your interests'
            }));
    }
}

export class TrendingStrategy implements IRecommendationStrategy {
    async getRecommendations(userId: string, limit: number): Promise<RecommendationItem[]> {
        // 1. Get user's items to exclude
        const userLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.userId, userId));
        const userListIds = userLists.map(l => l.id);
        let userItemTitles = new Set<string>();

        if (userListIds.length > 0) {
            const userItems = await db.select({ title: items.title }).from(items).where(inArray(items.listId, userListIds));
            userItemTitles = new Set(userItems.map(i => i.title.toLowerCase()));
        }

        // 2. Get Public Lists
        const publicLists = await db.select({ id: lists.id }).from(lists).where(eq(lists.isPublic, true));
        const publicListIds = publicLists.map(l => l.id);
        if (publicListIds.length === 0) return [];

        // 3. Get Random "Popular" items
        const candidates = await db
            .select({
                id: items.id,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                categoryId: items.categoryId,
            })
            .from(items)
            .where(inArray(items.listId, publicListIds))
            .orderBy(sql`RANDOM()`)
            .limit(limit);

        return candidates
            .filter(i => !userItemTitles.has(i.title.toLowerCase()))
            .map(i => ({
                ...i,
                reason: 'Popular on MyBacklog'
            }));
    }
}

// Facade / Composite Strategy
export class RecommendationEngine {
    private strategies: IRecommendationStrategy[];

    constructor() {
        this.strategies = [
            new ContentBasedStrategy(),
            new TrendingStrategy()
        ];
    }

    async getRecommendations(userId: string, totalLimit: number = 20): Promise<any[]> {
        const results = await Promise.all(this.strategies.map(s => s.getRecommendations(userId, Math.ceil(totalLimit / this.strategies.length))));

        // Flatten and Deduplicate
        const allRecs = results.flat();
        const seen = new Set<string>();
        const uniqueRecs = allRecs.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });

        // Resolve Category Names
        const allCategories = await db.select().from(categories);
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]));

        return uniqueRecs.map(item => ({
            ...item,
            category: categoryMap[item.categoryId]?.name || 'Unknown',
            categorySlug: categoryMap[item.categoryId]?.slug || 'unknown',
            reason: item.reason + (categoryMap[item.categoryId] ? ` (${categoryMap[item.categoryId].name})` : '')
        }));
    }
}
