# External API Setup Guide

## 1. Open Library (Books) - FREE

**No API key needed!**

```bash
# Search books
GET https://openlibrary.org/search.json?q=harry+potter

# Get cover image
GET https://covers.openlibrary.org/b/id/{cover_id}-M.jpg
```

**Seed books:**
```bash
npx tsx seed-books.ts
```

---

## 2. TMDB (Movies/TV) - FREE

1. Go to https://www.themoviedb.org/signup
2. Settings → API → Create → Developer
3. Copy your API Key (v3)

**Add to `.env.local` and Vercel:**
```env
TMDB_API_KEY=your_api_key_here
```

---

## 3. Music APIs - FREE Alternatives

Since Spotify isn't accepting new integrations:

### MusicBrainz (Recommended)
- **Cost:** FREE, no key
- **URL:** https://musicbrainz.org/doc/MusicBrainz_API
```bash
GET https://musicbrainz.org/ws/2/release?query=album:thriller&fmt=json
```

### TheAudioDB
- **Cost:** FREE (key = "1" for dev)
- **URL:** https://theaudiodb.com/api_guide.php
```bash
GET https://theaudiodb.com/api/v1/json/1/searchalbum.php?s=coldplay&a=parachutes
```

---

## Environment Variables (Vercel)

| Variable | Required |
|----------|----------|
| `TMDB_API_KEY` | For movies/TV |
