import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

// POST /api/requests - Submit a new item request
export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, category, year, notes } = body;

        // Validation
        if (!title || typeof title !== 'string' || title.trim().length < 2) {
            return NextResponse.json({ error: 'Title is required (min 2 characters)' }, { status: 400 });
        }

        const validCategories = ['movies', 'tv', 'books', 'music', 'games'];
        if (!category || !validCategories.includes(category)) {
            return NextResponse.json({ error: 'Valid category is required' }, { status: 400 });
        }

        if (notes && notes.length > 500) {
            return NextResponse.json({ error: 'Notes must be under 500 characters' }, { status: 400 });
        }

        // Sanitize inputs (escape markdown special chars)
        const sanitize = (str: string) => str
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .trim();

        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const userEmail = session.user.email;
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

        // Format the request entry
        const entry = `
### ${timestamp} | ${categoryLabel} | ${userEmail}
**Title:** ${sanitize(title)}  
${year ? `**Year:** ${sanitize(String(year))}  \n` : ''}${notes ? `**Notes:** ${sanitize(notes)}  \n` : ''}**Status:** ⏳ Pending

---
`;

        // Append to the requests file
        const filePath = path.join(process.cwd(), 'Steering Documents', 'item_requests.md');

        await fs.appendFile(filePath, entry, 'utf8');

        return NextResponse.json({
            success: true,
            message: 'Request submitted! We\'ll review it soon.'
        });

    } catch (error) {
        console.error('[REQUESTS] Error saving request:', error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}
