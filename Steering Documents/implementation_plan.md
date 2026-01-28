# Sprint 19: Category Images Fixes 🖼️

---

## Goal
Ensure all categories (Books, Games, Music) have reliable image sources. Currently, Movies/TV (TMDB) are stable, but others fail or lack fallbacks.

## Issues Identified
- **Books**: Google Books API images often missing or restricted.
- **Games**: RAWG API search might be missing background_image.
- **Music**: Spotify token handling is manual/hardcoded and expires.

---

## Proposed Changes

### 1. Books Image Fallback
#### [MODIFY] [route.ts](file:///C:/Users/slyat/.gemini/antigravity/scratch/MyBacklog/src/app/api/metadata/search/route.ts)
- Implement `OpenLibrary` fallback for books.
- Logic: If Google Books returns no image or `thumbnail` check size, try `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`.
- Need to ensure we capture ISBN from Google Books results.

### 2. Music Token Automation
#### [MODIFY] [route.ts](file:///C:/Users/slyat/.gemini/antigravity/scratch/MyBacklog/src/app/api/metadata/search/route.ts)
- Implement Client Credentials Flow for Spotify.
- Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to env check.
- Fetch fresh token before search if expired.

### 3. Games Image Optimization
#### [MODIFY] [route.ts](file:///C:/Users/slyat/.gemini/antigravity/scratch/MyBacklog/src/app/api/metadata/search/route.ts)
- RAWG `background_image` is usually good.
- Add fallback to `background_image_additional` if main is missing.
- Add generic genre-based placeholders if API returns nothing.

### 4. Fix Dashboard Stats Widgets
#### [MODIFY] [page.tsx](file:///C:/Users/slyat/.gemini/antigravity/scratch/MyBacklog/src/app/(dashboard)/dashboard/page.tsx)
- **Issue**: Dashboard attempts to count `list.items`, but `GET /api/lists` only returns `list.stats`.
- **Fix**: Update aggregation logic to sum up `list.stats` properties.
```typescript
// Old
if (list.items) { aggregatedStats.movies += list.items.filter(...).length; }

// New
if (list.stats) { 
    aggregatedStats.movies += list.stats.movies;
    aggregatedStats.tv += list.stats.tv;
    // ...etc
}
```

---

## Verification Plan

### Automated
- Create a script `scripts/verify-images.ts` that searches for top 10 items in each category and reports missing `imageUrl`.

### Manual
1. Search "Dune" (Book) -> Verify cover
2. Search "Elden Ring" (Game) -> Verify art
3. Search "Thriller" (Music) -> Verify album art
