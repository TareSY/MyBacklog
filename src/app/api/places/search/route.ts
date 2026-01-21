import { NextRequest, NextResponse } from 'next/server';

// GET /api/places/search?q=query&type=restaurant|entertainment|attraction
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'establishment';

    if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    try {
        // Map our category types to Google Places types
        const typeMapping: Record<string, string> = {
            restaurant: 'restaurant',
            entertainment: 'night_club|movie_theater|stadium|amusement_park',
            attraction: 'tourist_attraction|museum|park|zoo|aquarium',
        };

        const googleType = typeMapping[type] || 'establishment';

        // Use Google Places Text Search API
        const url = new URL('https://maps.googleapis.com/maps/googleapis/place/textsearch/json');
        url.searchParams.set('query', query);
        url.searchParams.set('type', googleType.split('|')[0]); // Use first type for now
        url.searchParams.set('key', apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('[PLACES] Google API error:', data.status, data.error_message);
            return NextResponse.json({ error: 'Places search failed' }, { status: 500 });
        }

        // Transform results to our format
        const results = (data.results || []).slice(0, 10).map((place: any) => ({
            id: place.place_id,
            placeId: place.place_id,
            title: place.name,
            subtitle: place.formatted_address,
            address: place.formatted_address,
            latitude: place.geometry?.location?.lat?.toString(),
            longitude: place.geometry?.location?.lng?.toString(),
            imageUrl: place.photos?.[0]
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
                : null,
            rating: place.rating,
            category: type,
            categorySlug: type,
        }));

        return NextResponse.json({
            results,
            total: results.length,
            query,
            type,
        });
    } catch (error) {
        console.error('[PLACES] Search error:', error);
        return NextResponse.json({ error: 'Places search failed' }, { status: 500 });
    }
}
