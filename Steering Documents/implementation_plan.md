# Sprint 20: Item Request Feature 📝

---

## Goal
Allow users to request items that don't exist in the database. Requests are collected in a markdown file for manual review, then periodically processed to add new items via API calls.

---

## User Story
> "As a user, I can't find a specific movie/book/game. I want to request it so the admins can add it later."

---

## Design Decisions

### 1. User-Friendly Fields (NOT API fields)
Users fill in simple fields they understand:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | What they're looking for |
| `category` | select | ✅ | Movies, TV, Books, Music, Games |
| `year` | string | | Approximate year (e.g., "2020" or "late 90s") |
| `notes` | text | | Extra context ("the one with Tom Hanks", "the remake not original") |

### 2. Storage: Markdown File
Requests are appended to `Steering Documents/item_requests.md`:
- Easy to read/review in VS Code or GitHub
- Version controlled
- No database migration needed
- Can be edited/deleted manually

### 3. Admin Workflow
1. Periodically review `item_requests.md`
2. Search APIs manually or via scripts
3. Add items via existing "Add Item" flow
4. Mark requests as DONE or REJECTED in the file

---

## Proposed Changes

### Backend

#### [NEW] route.ts (`/api/requests`)
- `POST /api/requests` - Submit a new item request
- Appends to `Steering Documents/item_requests.md`
- Rate limited: 5 requests per user per day (optional)
- Returns success message

```typescript
// Request body
{
  title: string;      // required
  category: string;   // required: movies, tv, books, music, games
  year?: string;      // optional
  notes?: string;     // optional (max 500 chars)
}
```

### Frontend

#### [NEW] RequestItemModal.tsx
- Modal with form: Title, Category (dropdown), Year, Notes
- Submit button calls `/api/requests`
- Success toast: "Request submitted! We'll review it soon."
- Error handling for rate limiting

#### [MODIFY] Category pages / Browse page
- Add "Can't find what you're looking for?" link
- Opens RequestItemModal

### Storage

#### [NEW] item_requests.md
Format:
```markdown
# Item Requests

## Pending

### 2026-01-28 12:15:00 | Movies | user@example.com
**Title:** The Great Gatsby  
**Year:** 2013  
**Notes:** The one with Leonardo DiCaprio  
**Status:** ⏳ Pending

---

### 2026-01-28 11:00:00 | Games | user2@example.com
**Title:** Cyberpunk  
**Year:** 2020  
**Notes:** The CD Projekt Red game  
**Status:** ✅ Added

---
```

---

## Security Considerations
- Require authentication to submit requests
- Sanitize user input before writing to file
- Rate limit to prevent spam (5/day/user)
- No file path injection (hardcoded path)

---

## Verification Plan

### Manual Testing
1. Open Browse page → Click "Request Item"
2. Fill form → Submit → Check `item_requests.md`
3. Try submitting 6 requests → Should show rate limit error

### File Verification
- Check that markdown is properly formatted
- Check that special characters are escaped

---

## Future Enhancements (Out of Scope)
- Email notifications when request is processed
- Admin dashboard to manage requests
- Automated API search suggestions based on title
