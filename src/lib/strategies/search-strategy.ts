import { db } from '@/lib/db';
import { items, lists, categories } from '@/lib/db/schema';
import { ilike, or, eq, and } from 'drizzle-orm';

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    releaseYear: number | null;
    category: string;
    categorySlug: string;
}

export interface ISearchStrategy {
    search(query: string, category: string, limit: number): Promise<SearchResult[]>;
}

export class LocalDatabaseSearchStrategy implements ISearchStrategy {
    async search(query: string, category: string, limit: number): Promise<SearchResult[]> {
        // 1. Resolve Category Slug to ID (if filtering)
        let categoryId: number | undefined;
        if (category !== 'all') {
            const [cat] = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
            if (cat) categoryId = cat.id;
        }

        // 2. Get Public Lists (Security/Privacy filter)
        const publicLists = await db
            .select({ id: lists.id })
            .from(lists)
            .where(eq(lists.isPublic, true));

        const publicListIds = publicLists.map(l => l.id);
        if (publicListIds.length === 0) return [];

        // 3. Perform Search
        const searchPattern = `%${query}%`;
        const categoryFilter = categoryId ? eq(items.categoryId, categoryId) : undefined;

        const dbResults = await db
            .select({
                id: items.id,
                title: items.title,
                subtitle: items.subtitle,
                imageUrl: items.imageUrl,
                releaseYear: items.releaseYear,
                categoryId: items.categoryId,
                listId: items.listId,
            })
            .from(items)
            .where(and(
                // Category Filter
                categoryFilter,
                // Text Match
                or(
                    ilike(items.title, searchPattern),
                    ilike(items.subtitle || '', searchPattern)
                )
            ))
            .limit(limit);

        // 4. Filter by List Privacy (in-memory for safety/simplicity or strict DB join)
        // Note: We could do a JOIN in the query above for performance, but keeping logic similar to original for now.
        // Actually, let's filter in memory as per original logic to match behavior perfectly.
        const filteredResults = dbResults.filter(item => publicListIds.includes(item.listId));

        // 5. Enhance with Category Metadata
        const allCategories = await db.select().from(categories);
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]));

        return filteredResults.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            imageUrl: item.imageUrl,
            releaseYear: item.releaseYear,
            category: categoryMap[item.categoryId]?.name || 'Unknown',
            categorySlug: categoryMap[item.categoryId]?.slug || 'unknown',
        }));
    }
}

export class SearchContext {
    private strategy: ISearchStrategy;

    constructor(strategy: ISearchStrategy) {
        this.strategy = strategy;
    }

    // Expandable to select strategy dynamically
    static getStrategy(source: string = 'local'): ISearchStrategy {
        // In future: if (source === 'tmdb') return new TMDBSearchStrategy();
        return new LocalDatabaseSearchStrategy();
    }
}
