# MyBacklog — Expected Behaviors

> Steering document defining how features should work.

---

## Core Features (Sprints 1-11)

### 1. Categories
The app supports **5 content types**:
| ID | Category | Icon | Emoji |
|----|----------|------|-------|
| 1 | Movies | Film | 🎬 |
| 2 | TV Shows | Tv | 📺 |
| 3 | Books | BookOpen | 📚 |
| 4 | Music | Music | 🎵 |
| 5 | Games | Gamepad2 | 🎮 |

### 2. Lists
- Users can create multiple lists
- **Master List**: First list created is `isPrimary = true`
  - Shows ALL items from ALL user's lists
  - Cannot be deleted
  - Badge shows "Master List"
- **Custom Lists**: User-created lists
  - Can be public or private
  - Can be deleted

### 3. Items
- Items are added via Browse page
- Each item has: title, subtitle, releaseYear, imageUrl, categoryId
- Music items have `subtype`: 'album' | 'song'
- Games items have `platform` field
- Items can be marked as completed

---

## Page Behaviors

### Dashboard (`/dashboard`)
**Expected:**
- Welcome header with user name
- Quick Stats: Count of items per category (5 cards)
- **Featured Content**: Curated suggestions for users to add
- **Suggested For You**: Interactive items (Quick Add supported)
- Friends Activity: Shows friends if user has any

### Browse (`/browse`)
**Expected:**
- Header: "Browse Entertainment ✨"
- Category Grid: 5 clickable cards (Movies, TV, Books, Music, Games)
- Clicking a card opens Add Item modal
- Public Lists section shows shared lists from other users

### List Detail (`/lists/[id]`)
**Expected:**
- List name + badges (Public, Master List)
- Item count + completion stats
- **Visibility Toggle**: 🌐 Public / 🔒 Private button
- **Delete List**: Only visible for non-master lists
- Filter buttons: All, Pending, Completed
- Drag & drop reordering

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lists` | GET/POST | Get/Create lists |
| `/api/lists/[id]` | GET/PUT/DELETE | Manage specific list |
| `/api/items` | GET/POST | Get items, Add item |
| `/api/items/[id]` | PUT/DELETE | Update/Delete item |
| `/api/featured` | GET | Get recent/curated items |
| `/api/friends` | GET | Get user's friends |

---

## Feature Specifications (Sprints 12+)

### Sprint 12: Production Hardening
**Expected:**
- **Error Boundaries**: Friendly error messages, "Try Again" buttons.
- **Loading States**: Skeletons for cards/lists/dashboard.
- **Images**: Blur placeholders, fallbacks for broken URLs.

### Sprint 13: Friend Comparison
**Expected:**
- **Compare Page**: `/friends/[id]/compare`.
- **Columns**: "Only You", "Shared", "Only [Friend]".
- **Venn Diagram**: Visual overlap representation.

### Sprint 14: Enhanced Search
**Expected:**
- **Global Shortcut**: `Ctrl+K` opens search.
- **Filters**: Category and Status dropdowns.
- **Recent Searches**: Saves last 5 queries.

### Sprint 15: User Profiles
**Expected:**
- **Public Profile**: `/user/[username]` (no auth needed).
- **Stats**: Join date, category breakdown.
- **Activity**: Recently completed items.

### Sprint 16: Notifications
**Expected:**
- **Bell Icon**: Red badge for unread items.
- **Polling**: Updates every 60s.
- **Actions**: "Mark all as read".

### Sprint 18: Quick Add & Suggestions
**Expected:**
- **Quick Add**: "Plus" buttons open modal with list selector.
- **Suggestions**: Dashboard items are clickable/addable.
- **Indicators**: Already-owned items show checkmark/disabled state (Category page).

---

## Known Limitations

- No offline support
- No mobile app (web only)
- Music search requires Spotify API
- Real-time notifications require WebSocket (future)
