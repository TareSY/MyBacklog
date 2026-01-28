# MyBacklog — Lessons Learned

> Document tracking bugs, issues, and patterns to avoid repeating mistakes.

---

## Bug Patterns & Fixes

### 1. Toast Hook Misuse 🔔
**Pattern**: Using `addToast` when hook returns `toast`
**Files Affected**: `settings/page.tsx`, `friends/page.tsx`
**Symptoms**: Toast notifications silently fail, errors not shown to users
**Fix**: Change `const { addToast } = useToast()` → `const { toast } = useToast()`
**Prevention**: Always check hook return type when using

### 2. Legacy Data Migration 📊
**Pattern**: New schema structures not accounting for old data
**Files Affected**: `/api/lists/[id]/route.ts`
**Symptoms**: Items added before `item_lists` table exist but don't display
**Fix**: Query BOTH `item_lists` AND `items.listId` for backward compatibility
**Prevention**: Always consider migration path for existing data

### 3. Placeholder Comments Replacing Code 💬
**Pattern**: Shortening code with `{/* ... unchanged ... */}` comments
**Files Affected**: `browse/page.tsx`
**Symptoms**: Entire page sections missing
**Fix**: Restored full JSX content
**Prevention**: Never use placeholder comments in production code

### 4. Strategy Validation Order 🔧
**Pattern**: Validating before resolving dependent values
**Files Affected**: `/api/items/route.ts`
**Symptoms**: "Failed to add item" when using `listIds` array
**Fix**: Resolve `listId` from `listIds` BEFORE calling `strategy.validate()`
**Prevention**: Ensure all required fields are resolved before validation

### 5. Database Column Missing 🗄️
**Pattern**: Code assumes columns exist that haven't been migrated
**Files Affected**: Various (is_primary, position columns)
**Symptoms**: 500 errors on API calls
**Fix**: Run SQL migration scripts in Neon dashboard
**Prevention**: Always test locally AND verify schema in production

---

## Common Coding Mistakes to Avoid

| Mistake | Example | Correct Approach |
|---------|---------|------------------|
| Undefined destructuring | `const { addToast } = useToast()` when hook returns `{ toast }` | Check hook return types |
| Race conditions | Not checking for existing friendship before insert | Add unique constraint or check before insert |
| Missing null checks | `item.rating >= star` when rating is null | `(item.rating || 0) >= star` |
| Hardcoded category IDs | Checking `categoryId === 6` for Places | Use category constants or enums |
| Incomplete conditional | `Object.keys(obj).length > 0` when values are empty arrays | `Object.values(obj).some(arr => arr.length > 0)` |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Strategy Pattern for Items | Allows category-specific validation without switch statements |
| item_lists join table | Enables M:N relationship between items and lists |
| ShareSlug for lists | Human-readable URLs instead of UUIDs for shared lists |
| Master List (isPrimary) | First list is protected, aggregates all items |

---

## Performance Considerations

### 1. Parallel Fetching
**Pattern**: Use `Promise.all` for independent async operations
```typescript
// ✅ Good: Parallel fetching (Dashboard)
const [listsRes, featuredRes, friendsRes] = await Promise.all([
    fetch('/api/lists'),
    fetch('/api/featured'),
    fetch('/api/friends')
]);
```

**Where implemented**: Dashboard, Browse (user lists + suggestions)

### 2. Batched Queries (No N+1)
**Pattern**: Fetch all related data in one query, then map in memory
```typescript
// ✅ Good: Single query for all list stats
const allCounts = await db
    .select({ listId, categoryId, count: sql`count(*)` })
    .from(items)
    .where(sql`listId IN (${listIds.join(',')})`)
    .groupBy(items.listId, items.categoryId);

// Then build map in memory
```

**Where implemented**: `/api/lists` (optimized)

### 3. Conditional Rendering
**Pattern**: Don't render sections with empty data
```tsx
// ✅ Good: Check for actual items
{Object.values(featured).some(arr => arr.length > 0) && (
    <FeaturedSection />
)}
```

**Where implemented**: Dashboard Featured, Friends Activity

### 4. Query Limits
| Location | Limit | Reason |
|----------|-------|--------|
| Sidebar Friends | 5 | Visual space |
| Dashboard Friends | 4 | Grid layout |
| Public Lists | 6 | Browse page |
| Item search | 20 | Autocomplete |

---

## Security Measures

### 1. Session Authentication
**Pattern**: Every API endpoint must verify session
```typescript
// ✅ Required at top of every API route
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Verification**: All 11 API routes checked ✅

### 2. Ownership Verification
**Pattern**: Before mutating, verify user owns resource
```typescript
// ✅ Good: Check ownership before update/delete
const [list] = await db.select().from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, session.user.id)));
if (!list) return 401;
```

**Where implemented**: `/api/lists/[id]`, `/api/items/[id]`

### 3. Password Security
| Measure | Implementation |
|---------|----------------|
| Hashing | bcrypt cost factor 12 |
| Comparison | `bcrypt.compare(input, hash)` |
| Storage | Never store plaintext |
| Response | Never return password field |

### 4. Input Validation (Strategy Pattern)
```typescript
// ✅ Good: Validate before database operations
strategy.validate(data); // Throws on invalid
const insertData = strategy.prepareForInsert(data);
```

### 5. SQL Injection Prevention
**Pattern**: Always use parameterized queries (Drizzle ORM handles this)
```typescript
// ✅ Safe: Drizzle parameterizes
.where(eq(items.title, userInput))

// ❌ Unsafe: Raw SQL with user input
.where(sql`title = ${userInput}`) // Only when necessary
```

---

## Verification Checklist

### API Security Audit
- [x] All endpoints check `session?.user?.id`
- [x] All mutations verify resource ownership
- [x] No password/sensitive data in responses
- [x] Rate limiting (Vercel Edge default)

### Performance Audit
- [x] Parallel fetching where possible
- [x] No N+1 queries
- [x] Query limits on lists
- [x] Skeleton loading states

---

## Sprint 12-13 Lessons

### 1. CSS-Only Visualizations over Libraries 📊
**Pattern**: Use CSS for simple charts instead of adding dependencies
**Example**: Created `VennDiagram.tsx` with pure CSS instead of installing `recharts`
**Benefit**: Smaller bundle, no learning curve, easier to style
**When to use library**: Complex interactions, animations, tooltips

### 2. Check for Existing Features First 🔍
**Pattern**: Before building, search codebase for existing implementations
**Example**: API endpoint `/api/friends/[id]/compare` and compare page already existed
**Benefit**: Saved hours of development time
**Prevention**: Always `grep_search` or `find_by_name` before creating new files

### 3. ErrorBoundary in Server Components 🛡️
**Pattern**: Server components can't use React ErrorBoundary directly
**Solution**: Create client wrapper component (`DashboardErrorWrapper.tsx`)
```tsx
'use client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
export function DashboardErrorWrapper({ children }) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
}
```
**Where used**: Dashboard layout wraps children with this wrapper

### 4. Image Error Handling 🖼️
**Pattern**: External images (TMDB, Spotify) may fail to load
**Solution**: `ImageWithFallback` component with `onError` + category icon fallback
**Benefit**: No broken images in UI, graceful degradation

### 5. Global Keyboard Shortcuts ⌨️
**Pattern**: ⌘K / Ctrl+K for global search
**Implementation**:
```tsx
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setOpen(true);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```
**Key Points**: 
- Use `e.preventDefault()` to prevent browser's default ⌘K behavior
- Clean up event listener in useEffect return
- Focus input when dialog opens

### 6. Public Profile Security 🔒
**Pattern**: Never expose internal IDs or sensitive data in public endpoints
**Example**: `/api/users/[username]` returns stats but not user.id
```typescript
return NextResponse.json({
    user: { ...user, id: undefined }, // Strip internal ID
    stats: { ... },
});
```

### 7. Notifications Polling ⏰
**Pattern**: Use setInterval for real-time updates without WebSockets
**Implementation**: Poll every 60 seconds, clean up on unmount
```tsx
useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
}, []);
```
**Alternative**: WebSockets for true real-time (more complex)

---

## Sprint 18 Lessons

### 8. Quick-Add Buttons Need Actual Logic ➕
**Pattern**: Don't use placeholder redirects for action buttons
**Bad**: `<Button onClick={() => router.push('/browse')}>Add</Button>`
**Good**: Open modal with list selector, POST to API
**Prevention**: Always test that buttons do what they visually promise

### 9. Already-Added Indicators 📋
**Pattern**: Show users what they already own to prevent duplicates
**Implementation**:
```tsx
const addedTitles = useMemo(() => 
    new Set(items.map(i => i.title?.toLowerCase())), [items]);
const isAlreadyAdded = (title: string) => addedTitles.has(title.toLowerCase());
```
**Benefit**: UX clarity, prevents API 409 errors

### 10. API Image Quality Fallbacks 🖼️
**Pattern**: External APIs often return low-quality or missing images
**Google Books fix**: `large || medium || small || thumbnail`
**Prevention**: Always use fallback chains for external image URLs

### 11. Modal Scrollability 📜
**Pattern**: Modals with dynamic content may overflow screen
**Fix**: Add `max-h-[90vh] overflow-y-auto` to modal body
**Component**: Created `ModalBody` with built-in scrolling

