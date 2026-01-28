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
                // Try MusicBrainz first (free, no auth), fallback to Spotify if configured
                results = await searchMusicBrainz(query);
                if (results.length === 0) {
                    results = await searchSpotify(query);
                }
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

// MusicBrainz Search (Free, no API key required)
async function searchMusicBrainz(query: string): Promise<any[]> {
    const url = `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(query)}&limit=10&fmt=json`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'MyBacklog/1.0 (https://thebacklog.vercel.app)',
            }
        });

        if (!res.ok) {
            console.warn('[METADATA] MusicBrainz fetch failed:', res.status);
            return [];
        }

        const data = await res.json();

        return (data.releases || []).map((item: any) => {
            // Get artist names
            const artists = item['artist-credit']?.map((a: any) => a.artist?.name || a.name).filter(Boolean).join(', ');
            // Cover Art Archive URL (may not always have an image)
            const imageUrl = item.id ? `https://coverartarchive.org/release/${item.id}/front-250` : null;

            return {
                externalId: item.id,
                externalSource: 'musicbrainz',
                title: item.title,
                subtitle: artists || 'Unknown Artist',
                releaseYear: item.date?.split('-')[0],
                imageUrl: imageUrl,
                subtype: 'album',
                description: item['release-group']?.['primary-type'] || 'Album',
            };
        });
    } catch (error) {
        console.error('[METADATA] MusicBrainz search error:', error);
        return [];
    }
}

// ... existing TMDB/Google/RAWG functions ...

// Spotify Client Credentials token cache
let spotifyTokenCache: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken(): Promise<string | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('[METADATA] SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not configured');
        return null;
    }

    // Return cached token if still valid (with 60s buffer)
    if (spotifyTokenCache && Date.now() < spotifyTokenCache.expiresAt - 60000) {
        return spotifyTokenCache.token;
    }

    try {
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            },
            body: 'grant_type=client_credentials',
        });

        if (!res.ok) {
            console.error('[METADATA] Spotify token fetch failed:', res.status);
            return null;
        }

        const data = await res.json();
        spotifyTokenCache = {
            token: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };
        return data.access_token;
    } catch (error) {
        console.error('[METADATA] Spotify token error:', error);
        return null;
    }
}

// Spotify Search (Music)
async function searchSpotify(query: string): Promise<any[]> {
    const token = await getSpotifyToken();
    if (!token) {
        return [];
    }

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,track&limit=10`;

    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            // Token expired mid-request, clear cache
            spotifyTokenCache = null;
            console.warn('[METADATA] Spotify token expired mid-request');
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
            imageUrl: item.images?.[0]?.url || item.images?.[1]?.url,
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

// Google Books Search (with OpenLibrary fallback)
async function searchGoogleBooks(query: string): Promise<any[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    const res = await fetch(url);
    const data = await res.json();

    return (data.items || []).map((item: any) => {
        const imageLinks = item.volumeInfo?.imageLinks;
        // Try to get the best quality image available (large > medium > small > thumbnail)
        let imageUrl = imageLinks?.large
            || imageLinks?.medium
            || imageLinks?.small
            || imageLinks?.thumbnail;

        // Clean up Google Books URL
        if (imageUrl) {
            imageUrl = imageUrl.replace('http:', 'https:').replace('&edge=curl', '');
        }

        // OpenLibrary fallback: if no Google image, try ISBN-based cover
        if (!imageUrl) {
            const identifiers = item.volumeInfo?.industryIdentifiers || [];
            const isbn13 = identifiers.find((i: any) => i.type === 'ISBN_13')?.identifier;
            const isbn10 = identifiers.find((i: any) => i.type === 'ISBN_10')?.identifier;
            const isbn = isbn13 || isbn10;
            if (isbn) {
                imageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            }
        }

        return {
            externalId: item.id,
            externalSource: 'google_books',
            title: item.volumeInfo?.title,
            subtitle: item.volumeInfo?.authors?.join(', '),
            releaseYear: item.volumeInfo?.publishedDate?.split('-')[0],
            description: item.volumeInfo?.description?.slice(0, 500),
            imageUrl: imageUrl || null,
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

    return (data.results || []).map((item: any) => {
        // Image fallback chain: background_image > short_screenshots[0] > null
        let imageUrl = item.background_image;
        if (!imageUrl && item.short_screenshots?.length > 0) {
            imageUrl = item.short_screenshots[0]?.image;
        }

        // Get top 3 platforms for cleaner subtitle
        const platforms = item.platforms?.slice(0, 3).map((p: any) => p.platform?.name).filter(Boolean).join(', ');

        return {
            externalId: String(item.id),
            externalSource: 'rawg',
            title: item.name,
            subtitle: platforms || 'Multi-platform',
            releaseYear: item.released?.split('-')[0],
            description: null,
            imageUrl: imageUrl || null,
            platform: item.platforms?.[0]?.platform?.name,
        };
    });
}
