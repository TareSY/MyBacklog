import { NextRequest, NextResponse } from 'next/server';

// GET /api/metadata/search?q=query&category=movies|tv|books|games|music
// Searches external APIs for item metadata including high-res images
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const category = searchParams.get('category') || 'movies';

    if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    try {
        let results: any[] = [];

        switch (category) {
            case 'movies':
            case 'tv':
                results = await searchTMDB(query, category);
                break;
            case 'books':
                results = await searchGoogleBooks(query);
                break;
            case 'games':
                results = await searchRAWG(query);
                break;
            case 'music':
                results = await searchSpotify(query);
                break;
            default:
                results = [];
        }

        return NextResponse.json({
            results,
            total: results.length,
            query,
            category,
        });
    } catch (error) {
        console.error('[METADATA] Search error:', error);
        return NextResponse.json({ error: 'Metadata search failed' }, { status: 500 });
    }
}

// ... existing TMDB/Google/RAWG functions ...

// Spotify Search (Music)
async function searchSpotify(query: string): Promise<any[]> {
    // User provided token - normally this should be in env/session
    // and handled via client credentials flow as these expire quickly.
    const token = 'BQABVAV1zZERC3ySvqUWYWiuXbINluseOWY8S16V0iEBwzSCjd_8diF3gWP1q7A9xtoVAJE3mCrUYB9bDaOwSj2kLceCzvzKQP91ylVujP1HQFyUiUo-qTH4WcgV8-S4ViweVfDZhYAlk_ZsAJuNyVbDDR-oQy5MsJ0mtG5uYmiPf9fsFDV1ULSejARvr6jdmBduChLBoHM4tWDj31jhBJyziBe0UjUWpyiBwPgJQz4UFjPOFJEZxIXRq7aj4Tzg1LVzN-ws5OxoMks-HjhYStB9w4Y_SblPaI4h1Bcwh7imRCvB';

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,track&limit=10`;

    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            console.warn('[METADATA] Spotify token expired or invalid');
            return [];
        }

        const data = await res.json();

        // Combine albums and tracks
        const albums = (data.albums?.items || []).map((item: any) => ({
            externalId: item.id,
            externalSource: 'spotify',
            title: item.name,
            subtitle: item.artists?.map((a: any) => a.name).join(', '),
            releaseYear: item.release_date?.split('-')[0],
            imageUrl: item.images?.[0]?.url || item.images?.[1]?.url, // 0 is usually huge, 1 is medium
            subtype: 'album',
            description: `Album • ${item.total_tracks} tracks`,
        }));

        const tracks = (data.tracks?.items || []).map((item: any) => ({
            externalId: item.id,
            externalSource: 'spotify',
            title: item.name,
            subtitle: item.artists?.map((a: any) => a.name).join(', '),
            releaseYear: item.album?.release_date?.split('-')[0],
            imageUrl: item.album?.images?.[0]?.url,
            subtype: 'song',
            description: item.album?.name,
        }));

        return [...albums, ...tracks];
    } catch (error) {
        console.error('[METADATA] Spotify search error:', error);
        return [];
    }
}

// TMDB Search (Movies & TV)
async function searchTMDB(query: string, type: 'movies' | 'tv'): Promise<any[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        console.warn('[METADATA] TMDB_API_KEY not configured');
        return [];
    }

    const mediaType = type === 'movies' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`;

    const res = await fetch(url);
    const data = await res.json();

    return (data.results || []).slice(0, 10).map((item: any) => ({
        externalId: String(item.id),
        externalSource: 'tmdb',
        title: item.title || item.name,
        subtitle: item.original_title || item.original_name,
        releaseYear: item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0],
        description: item.overview,
        imageUrl: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
        rating: item.vote_average,
    }));
}

// Google Books Search
async function searchGoogleBooks(query: string): Promise<any[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    const res = await fetch(url);
    const data = await res.json();

    return (data.items || []).map((item: any) => {
        const imageLinks = item.volumeInfo?.imageLinks;
        // Try to get the best quality image available (large > medium > small > thumbnail)
        const imageUrl = imageLinks?.large
            || imageLinks?.medium
            || imageLinks?.small
            || imageLinks?.thumbnail;

        return {
            externalId: item.id,
            externalSource: 'google_books',
            title: item.volumeInfo?.title,
            subtitle: item.volumeInfo?.authors?.join(', '),
            releaseYear: item.volumeInfo?.publishedDate?.split('-')[0],
            description: item.volumeInfo?.description?.slice(0, 500),
            // Replace http with https and remove edge=curl parameter for cleaner images
            imageUrl: imageUrl?.replace('http:', 'https:').replace('&edge=curl', '') || null,
        };
    });
}

// RAWG Search (Games)
async function searchRAWG(query: string): Promise<any[]> {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
        console.warn('[METADATA] RAWG_API_KEY not configured');
        return [];
    }

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=10`;

    const res = await fetch(url);
    const data = await res.json();

    return (data.results || []).map((item: any) => ({
        externalId: String(item.id),
        externalSource: 'rawg',
        title: item.name,
        subtitle: item.platforms?.map((p: any) => p.platform?.name).join(', '),
        releaseYear: item.released?.split('-')[0],
        description: null, // RAWG doesn't return description in search
        imageUrl: item.background_image || null,
        platform: item.platforms?.[0]?.platform?.name,
    }));
}
