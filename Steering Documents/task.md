# MyBacklog — Task Tracker

> **Live Site**: [thebacklog.vercel.app](https://thebacklog.vercel.app)

---

## 📊 Project Status

| Area | Status |
|------|--------|
| Core Platform | ✅ Complete |
| 5 Categories | ✅ Complete |
| UI/UX Polish | ✅ Complete |
| Social Features | ✅ Backend Complete |
| Codebase Audit | ✅ Complete |
| Unit Testing | ✅ 22 tests passing |

---

## Completed Sprints ✅

<details>
<summary><strong>Sprint History (Sprints 1-7)</strong></summary>

### Sprint 1: Core Platform
- Next.js 14 with App Router
- PostgreSQL + Drizzle ORM
- NextAuth.js authentication (credentials)
- Responsive dark theme UI

### Sprint 2: Content Library
- 50,000+ items seeded (Movies, TV, Books, Music, Games)

### Sprint 3: UI/UX Polish
- Toast notifications, Category pages, Mobile fixes

### Sprint 4: Architecture
- Strategy Pattern, Seeder Strategy, Recommendation Engine

### Sprint 5: Codebase Audit
- All 11 API endpoints verified
- Security and performance patterns documented

### Sprint 6: UI Polish
- Animations (hover effects, stagger)
- Mobile (44px touch targets, full-screen modals)
- Accessibility (skip links, ARIA, focus rings)

### Sprint 7: Recent Fixes
- Places category removed (focus on core 5)
- Curated suggestions added
- Public/Private toggle
- Star rating system
- Client-side list filtering

</details>

---

## 🚀 Sprint 12: Production Hardening 🔒 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 12.1.1 | Create `ErrorBoundary.tsx` component | ✅ |
| 12.1.2 | Create `ErrorFallback.tsx` with retry | ✅ |
| 12.1.3 | Wrap dashboard layout | ✅ |
| 12.2.1 | Create `LoadingSpinner.tsx` | ✅ |
| 12.2.2 | Create `SkeletonCard.tsx` | ✅ |
| 12.2.3 | Add `loading.tsx` to dashboard | ✅ |
| 12.3.1 | Add blur placeholders to images | ✅ (via ImageWithFallback) |
| 12.3.2 | Add image error fallback | ✅ |
| 12.4.1 | Add meta tags to root layout | ✅ |
| 12.4.2 | Add `generateMetadata()` to lists | ⏳ (tech debt) |
| 12.4.3 | Create `robots.txt` | ✅ |
| 12.4.4 | Create `sitemap.ts` | ✅ |
| 12.5.1 | Install `@vercel/analytics` | ✅ |

---

## 🚀 Sprint 13: Friend Comparison 🔄 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 13.2.1 | Create `GET /api/friends/[id]/compare` | ✅ (existed) |
| 13.3.1 | Create compare page UI | ✅ (existed) |
| 13.3.2 | Three-column layout | ✅ |
| 13.3.3 | Add "Compare" button to friend cards | ✅ |
| 13.4.1 | Install recharts | ⏭️ Skipped (CSS-only) |
| 13.4.2 | Create VennDiagram component | ✅ |

---

## 🚀 Sprint 14: Enhanced Search 🔎 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 14.1.1 | Create `SearchDialog.tsx` | ✅ |
| 14.1.2 | Add ⌘K keyboard shortcut | ✅ |
| 14.2.1 | Create `GET /api/search` endpoint | ✅ (existed) |
| 14.2.2 | Add category/status filters | ✅ (existed) |
| 14.3.1 | Create `SearchResults.tsx` | ✅ (in dialog) |
| 14.3.2 | Add keyboard navigation | ✅ |
| 14.4.1 | Add recent searches (localStorage) | ✅ |

---

## 🚀 Sprint 15: User Profiles 👤 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 15.1.1 | Add `username`, `bio`, `avatarUrl` columns | ✅ (existed) |
| 15.2.1 | Create `GET /api/users/[username]` | ✅ |
| 15.2.2 | Create `PUT /api/users/me` | ✅ (existed at /api/user) |
| 15.3.1 | Create `/user/[username]/page.tsx` | ✅ |
| 15.3.2 | Add "Add Friend" button | ⏭️ (future) |
| 15.4.1 | Add profile section to Settings | ✅ (existed) |

---

## 🚀 Sprint 16: Notifications 🔔 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 16.1.1 | Create `notifications` table | ✅ |
| 16.2.1 | Create `GET /api/notifications` | ✅ |
| 16.2.2 | Create mark-as-read endpoints | ✅ (PUT) |
| 16.2.3 | Create notification helper | ⏭️ (future) |
| 16.3.1 | Create `NotificationBell.tsx` | ✅ |
| 16.3.2 | Add unread badge | ✅ |
| 16.3.3 | Add dropdown UI | ✅ |

---

## 🚀 Sprint 17: Code Review & Testing 🧪 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 17.1 | Review design patterns | ✅ Strategy, Factory verified |
| 17.2 | Bug audit (14 issues found) | ✅ |
| 17.3 | Fix N+1 query (notifications) | ✅ |
| 17.4 | Fix localStorage parsing | ✅ |
| 17.5 | Fix parseInt NaN check | ✅ |
| 17.6 | Setup Jest + RTL | ✅ |
| 17.7 | Unit tests (Button, Card, Badge) | ✅ 22 tests |
| 17.8 | Replace `any` types | ✅ ListUpdateData, Error instanceof |
| 17.9 | Implement nanoid for slugs | ✅ |

---

## 🚀 Sprint 18: Bug Fixes - Add Flow & Images 🐛 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 18.1 | Fix Plus button on Category page (not adding items) | ✅ |
| 18.2 | Add list selector modal for quick-add | ✅ |
| 18.3 | Show "already added" indicator (checkmark) | ✅ |
| 18.4 | Fix book images not showing (API fallback) | ✅ |
| 18.5 | Update lessons_learned.md with new patterns | ✅ |
| 18.6 | Add ModalBody component for scrollable content | ✅ |
| 18.7 | Expand curated content (10→20 items, 2000s-2024) | ✅ |
| 18.8 | Update `expected_behaviors.md` | ✅ |
| 18.9 | Update `validation_checklist.md` | ✅ |

---

## 🚀 Sprint 19: Category Images Fixes 🖼️ ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 19.1 | Fix Books image fallback (OpenLibrary API) | ✅ |
| 19.2 | Fix Games images (RAWG fallback chain) | ✅ |
| 19.3 | Fix Music images (MusicBrainz primary, Spotify fallback) | ✅ |
| 19.4 | Add automated image existence checks | ⏭️ Deferred |
| 19.5 | Fix Dashboard stats staying at zero (widget bug) | ✅ |

---

## 🚀 Sprint 20: Item Request Feature 📝 ✅ COMPLETE

| # | Task | Status |
|---|------|--------|
| 20.1 | Create `POST /api/requests` endpoint | ✅ |
| 20.2 | Create `RequestItemModal.tsx` component | ✅ |
| 20.3 | Add "Request Media" link to Browse page | ✅ |
| 20.4 | Create `item_requests.md` storage file | ✅ |
| 20.5 | Add rate limiting (5 requests/day/user) | ⏭️ Optional |

---

## Steering Documents 📚

| Document | Purpose |
|----------|---------|
| [expected_behaviors.md](./expected_behaviors.md) | Defines how features should work |
| [lessons_learned.md](./lessons_learned.md) | Bugs and patterns to avoid |
| [implementation_plan.md](./implementation_plan.md) | Technical architecture |
| [validation_checklist.md](./validation_checklist.md) | Feature verification status |
| [walkthrough.md](./walkthrough.md) | Feature summary |

---

## Development Philosophy 🎓

> **Why we document**: These steering docs prevent "drift" — where the agent forgets context between sessions. They also help YOU (the developer) remember decisions made weeks ago.

> **Why we plan before coding**: The "Next Sprint Candidates" section ensures we don't just build features randomly. We pick based on user value, technical debt, or strategic goals.

> **Why we validate**: The checklist proves the system works as documented. It catches regressions before users do.
