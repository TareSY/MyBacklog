import { db, isDatabaseConfigured } from '@/lib/db';
import { lists, items, users, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent, EmptyState } from '@/components/ui';
import { Film, Tv, Book, Music, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { FilteredList } from '@/components/lists/FilteredList';

const categoryIcons: Record<string, React.ReactNode> = {
    movies: <Film className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    books: <Book className="w-4 h-4" />,
    music: <Music className="w-4 h-4" />,
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function PublicListPage({ params }: PageProps) {
    const { slug } = await params;

    if (!isDatabaseConfigured()) {
        notFound();
    }

    // Find list by share slug
    const list = await db
        .select()
        .from(lists)
        .where(eq(lists.shareSlug, slug))
        .limit(1);

    if (list.length === 0 || !list[0].isPublic) {
        notFound();
    }

    // Get list owner
    const owner = await db
        .select({ name: users.name, username: users.username, image: users.image })
        .from(users)
        .where(eq(users.id, list[0].userId))
        .limit(1);

    // Get list items with categories
    const listItems = await db
        .select({
            id: items.id,
            title: items.title,
            subtitle: items.subtitle,
            platform: items.platform, // Fetch platform
            imageUrl: items.imageUrl,
            releaseYear: items.releaseYear,
            isCompleted: items.isCompleted,
            categorySlug: categories.slug,
            categoryName: categories.name,
        })
        .from(items)
        .leftJoin(categories, eq(items.categoryId, categories.id))
        .where(eq(items.listId, list[0].id));

    const ownerName = owner[0]?.name || owner[0]?.username || 'Anonymous';

    return (
        <div className="min-h-screen bg-bg-base">
            {/* Header */}
            <header className="bg-bg-surface border-b border-border-subtle">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Link href="/" className="text-primary-light hover:text-primary text-sm mb-4 inline-block">
                        ← Back to MyBacklog
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary">{list[0].name}</h1>
                    <p className="text-text-muted mt-1">
                        Shared by <span className="text-primary-light">{ownerName}</span>
                    </p>
                    {list[0].description && (
                        <p className="text-text-secondary mt-2">{list[0].description}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <Badge variant="info">{listItems.length} items</Badge>
                        <Badge variant="success">
                            {listItems.filter(i => i.isCompleted).length} completed
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Items */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <FilteredList items={listItems} categoryIcons={categoryIcons} />
            </main>
        </div>
    );
}
