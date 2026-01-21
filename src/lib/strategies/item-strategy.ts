import { items } from '@/lib/db/schema';

// Types tailored to our Item creation needs
export interface ItemInput {
    listId: string;
    categoryId: number;
    title: string;
    subtitle?: string; // used for author, platform, etc. in some contexts, but we now have specific cols
    platform?: string; // specific for games
    releaseYear?: number;
    imageUrl?: string;
    description?: string;
    externalId?: string;
    externalSource?: string;
}

export interface IItemStrategy {
    validate(data: Partial<ItemInput>): void;
    prepareForInsert(data: Partial<ItemInput>): Record<string, any>;
}

// Base Strategy with common logic
class BaseItemStrategy implements IItemStrategy {
    validate(data: Partial<ItemInput>): void {
        if (!data.listId) throw new Error('List ID is required');
        if (!data.categoryId) throw new Error('Category ID is required');
        if (!data.title || data.title.trim().length === 0) throw new Error('Title is required');
    }

    prepareForInsert(data: Partial<ItemInput>): Record<string, any> {
        return {
            listId: data.listId,
            categoryId: data.categoryId,
            title: data.title?.trim(),
            subtitle: data.subtitle?.trim() || null,
            imageUrl: data.imageUrl || null,
            releaseYear: data.releaseYear || null,
            description: data.description?.trim() || null,
            externalId: data.externalId || null,
            externalSource: data.externalSource || 'manual',
            // Default platform to null if not handled by subclass
            platform: null,
        };
    }
}

// Strategy for Games
class GameItemStrategy extends BaseItemStrategy {
    validate(data: Partial<ItemInput>): void {
        super.validate(data);
        // Games might require a platform, or at least it's recommended
        // For now we won't strictly enforce it to avoid breaking seeds, but we could.
    }

    prepareForInsert(data: Partial<ItemInput>): Record<string, any> {
        const base = super.prepareForInsert(data);
        // Explicitly handle platform
        return {
            ...base,
            platform: data.platform?.trim() || null,
        };
    }
}

// Strategy for other types (can be extended later)
class DefaultItemStrategy extends BaseItemStrategy { }

// Context / Factory
export class ItemStrategyContext {
    private static strategies: Record<number, IItemStrategy> = {
        5: new GameItemStrategy(),
        // 1 (Movie), 2 (TV), 3 (Book), 4 (Music) use Default for now
    };

    static getStrategy(categoryId: number): IItemStrategy {
        return this.strategies[categoryId] || new DefaultItemStrategy();
    }
}
