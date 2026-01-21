import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';
import { SearchContext } from '@/lib/strategies/search-strategy';

// GET /api/search?q=query&category=all|movies|books|tv|music&limit=20
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const strategy = SearchContext.getStrategy('local');
        const results = await strategy.search(query, category, limit);

        return NextResponse.json({
            results,
            total: results.length,
            query,
            category,
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
