# MyBacklog — Feature Walkthrough

> This document summarizes all features implemented across development sprints.

---

## Platform Overview

**MyBacklog** is a personal entertainment tracking application that helps users manage their backlog of movies, TV shows, books, music, and games.

**Tech Stack:**
- Next.js 16.1 (App Router)
- PostgreSQL + Drizzle ORM
- NextAuth.js (Credentials)
- Vercel Hosting + Analytics

---

## Core Features (Sprints 1-11) 🏛️

### 1. Item Management
- **5 Categories**: Movies 🎬, TV 📺, Books 📚, Music 🎵, Games 🎮.
- **Strategy Pattern**: Category-specific validation and creation logic.
- **Seeded Data**: 50,000+ items from external APIs.
- **Multi-List**: Items can belong to multiple lists.
- **Master List**: Default "My Backlog" aggregates all items.

### 2. User Experience
- **Toast Notifications**: Non-intrusive feedback.
- **Dark Mode**: Default modern UI with glassmorphism.
- **Mobile Optimization**: Touch targets, responsive grids, skeletons.
- **Accessibility**: ARIA labels, focus rings, skip links.

### 3. APIs & Integrations
- **TMDB**: Movies & TV metadata/images.
- **Google Books**: Book metadata.
- **Spotify**: Music metadata.
- **RAWG**: Game metadata and platform info.

### 4. Profiles
- **Avatars**: 12 preset options + custom URL.
- **Public/Private**: Toggle list visibility.
- **Friends**: Add friends, view public lists.

---

## Sprint 12: Production Hardening 🔒 ✅

| Component | File | Description |
|-----------|------|-------------|
| Error Boundary | `ErrorBoundary.tsx` | Catches React errors, shows friendly fallback |
| Loading Spinner | `LoadingSpinner.tsx` | Accessible spinner with size variants |
| Skeleton Cards | `SkeletonCard.tsx` | Shimmer animation matching card layout |
| Image Fallback | `ImageWithFallback.tsx` | Error handling, lazy loading |
| SEO | `sitemap.ts` | Dynamic sitemap with public lists |
| Analytics | `@vercel/analytics` | Production usage tracking |

---

## Sprint 13: Friend Comparison 🔄 ✅

| Component | File | Description |
|-----------|------|-------------|
| Compare API | `/api/friends/[id]/compare` | Returns stats and item lists |
| Compare Page | `/friends/[id]/compare` | Three-column layout with badges |
| Venn Diagram | `VennDiagram.tsx` | CSS-only overlap visualization |

**Key Decision**: Used CSS-only Venn diagram instead of recharts to keep bundle small.

---

## Sprint 14: Enhanced Search 🔎 ✅

| Component | File | Description |
|-----------|------|-------------|
| Search Dialog | `SearchDialog.tsx` | Modal with search results |
| Ctrl+K Shortcut | Header | Global keyboard shortcut (Windows friendly) |
| Recent Searches | localStorage | Last 5 searches saved |

**Features:**
- Debounced search (300ms)
- Category and Status filters
- Keyboard navigation (Arrows/Enter)

---

## Sprint 15: User Profiles 👤 ✅

| Component | File | Description |
|-----------|------|-------------|
| Profile API | `/api/users/[username]` | Returns public profile and stats |
| Profile Page | `/user/[username]/page.tsx` | Avatar, stats, categories, lists |

**Features:**
- Public profile with category breakdown
- Join date display
- Links to public lists

---

## Sprint 16: Notifications 🔔 ✅

| Component | File | Description |
|-----------|------|-------------|
| Notifications API | `/api/notifications` | GET (list), PUT (mark read) |
| NotificationBell | `NotificationBell.tsx` | Dropdown with unread badge |

**Features:**
- Unread count badge (shows 9+ if > 9)
- Mark all as read button
- Polling every 60 seconds
- Types: friend_request, friend_accepted, list_shared

---

## Sprint 17: Code Review & Testing 🧪 ✅

**Infrastructure:**
- **Jest + React Testing Library** setup
- **Unit Tests**: Button, Card, Badge components (22 tests passing)
- **E2E**: Playwright setup

**Bug Fixes:**
- Fixed N+1 query in notifications
- Fixed JSON parse error in SearchDialog
- Fixed `parseInt` NaN issues

---

## Sprint 18: Bug Fixes & Refinement 🐛 ✅

| Feature | Description |
|---------|-------------|
| **Quick Add Flow** | "Plus" buttons now open a modal to select a list immediately. |
| **Already Added** | Items you own show a "Checkmark" indicator to prevent duplicates. |
| **Dashboard Suggestions** | "Suggested For You" items are now interactive (Quick Add). |
| **Changelog** | Updated to v0.1.18 with "Fixings" text. |
| **Search UI** | Removed `⌘K` for Windows friendliness, added `Ctrl+K`. |

---

## Codebase Audit Summary ✅

- **APIs**: All 11 endpoints verified (Session, Ownership, Rate Limiting).
- **Security**: bcrypt password hashing, Drizzle ORM sanitization.
- **Performance**: Parallel fetching, batched queries, skeletons.
- **Architecture**: Strategy Pattern for items, separate Seeder/Search contexts.
