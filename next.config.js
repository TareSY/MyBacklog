/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'books.google.com',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
            },
            // OpenLibrary book covers
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
            },
            // RAWG game images
            {
                protocol: 'https',
                hostname: 'media.rawg.io',
            },
            // MusicBrainz Cover Art Archive
            {
                protocol: 'https',
                hostname: 'coverartarchive.org',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

module.exports = nextConfig;
