import { items } from '@/lib/db/schema';

// Types tailored to our Item creation needs
export interface ItemInput {
    listId: string;
    categoryId: number;
    title: string;
    subtitle?: string;
    platform?: string;
    releaseYear?: number;
    imageUrl?: string;
    description?: string;
    externalId?: string;
    externalSource?: string;
    // Location fields for Places
    placeId?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    // Music subtype
    subtype?: 'album' | 'song';
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
            platform: null,
            placeId: null,
            address: null,
            latitude: null,
            longitude: null,
        };
    }
}

// Strategy for Games
class GameItemStrategy extends BaseItemStrategy {
    validate(data: Partial<ItemInput>): void {
        super.validate(data);
    }

    prepareForInsert(data: Partial<ItemInput>): Record<string, any> {
        const base = super.prepareForInsert(data);
        return {
            ...base,
            platform: data.platform?.trim() || null,
        };
    }
}

// Strategy for Places (Restaurant, Entertainment, Attraction)
class PlacesItemStrategy extends BaseItemStrategy {
    validate(data: Partial<ItemInput>): void {
        super.validate(data);
    }

    prepareForInsert(data: Partial<ItemInput>): Record<string, any> {
        const base = super.prepareForInsert(data);
        return {
            ...base,
            externalSource: data.placeId ? 'google_places' : 'manual',
            placeId: data.placeId || null,
            address: data.address?.trim() || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
        };
    }
}

// Strategy for Music (Album/Song)
class MusicItemStrategy extends BaseItemStrategy {
    prepareForInsert(data: Partial<ItemInput>): Record<string, any> {
        const base = super.prepareForInsert(data);
        return {
            ...base,
            subtype: data.subtype || 'album', // Default to album
        };
    }
}

// Strategy for other types
class DefaultItemStrategy extends BaseItemStrategy { }

// Context / Factory
export class ItemStrategyContext {
    private static strategies: Record<number, IItemStrategy> = {
        4: new MusicItemStrategy(),  // Music
        5: new GameItemStrategy(),   // Games
        6: new PlacesItemStrategy(), // Restaurant
        7: new PlacesItemStrategy(), // Entertainment
        8: new PlacesItemStrategy(), // Attraction
    };

    static getStrategy(categoryId: number): IItemStrategy {
        return this.strategies[categoryId] || new DefaultItemStrategy();
    }
}
