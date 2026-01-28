import { MetadataRoute } from 'next';
import { db, isDatabaseConfigured } from '@/lib/db';
import { lists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://thebacklog.vercel.app';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Get public lists for sitemap
    let publicListPages: MetadataRoute.Sitemap = [];

    if (isDatabaseConfigured) {
        try {
            const publicLists = await db
                .select({
                    shareSlug: lists.shareSlug,
                    updatedAt: lists.updatedAt,
                })
                .from(lists)
                .where(eq(lists.isPublic, true))
                .limit(100);

            publicListPages = publicLists
                .filter((list) => list.shareSlug)
                .map((list) => ({
                    url: `${baseUrl}/share/${list.shareSlug}`,
                    lastModified: list.updatedAt || new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                }));
        } catch (error) {
            console.error('Error generating sitemap:', error);
        }
    }

    return [...staticPages, ...publicListPages];
}
