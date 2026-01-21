import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { RecommendationEngine } from '@/lib/strategies/recommendation-strategy';

// GET /api/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const engine = new RecommendationEngine();
        const recommendations = await engine.getRecommendations(session.user.id);

        return NextResponse.json({
            recommendations,
            // "based_on" logic was simplified in strategy to "reason" field in items, 
            // relying on simple list for now or we can re-add it if needed.
            // Client likely uses individual item reasons.
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
}
