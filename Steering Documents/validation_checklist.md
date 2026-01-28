# User Journey Validation Checklist

## 1. Item Management 📦
| Feature | Action | Expected Outcome | Status |
|---------|--------|------------------|--------|
| **Add Movie** | + → Select Movie → Search → Add | Item appears in list with metadata | ✅ |
| **Add TV Show** | + → Select TV → Search → Add | Item appears with TV metadata | ✅ |
| **Add Book** | + → Select Book → Search → Add | Item appears with Book metadata | ✅ |
| **Add Game** | + → Select Game → Search → Add | Item appears with Game metadata | ✅ |
| **Add Music** | + → Select Music → Search → Add | Item appears with Album/Song | ✅ |
| **Complete Item** | Click checkmark on item | Style changes, rating stars appear | ✅ |
| **Rate Item** | Click stars on completed item | Rating saved (1-5) | ✅ |
| **Remove Item** | Click trash → Confirm | Item removed immediately | ✅ |
| **Drag & Drop** | Drag item to new position | Order persisted on refresh | ✅ |

---

## Core Features Test Suite 🧪

### Test 1: Add 3 Items From Each Category
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1.1 | Browse → Movies → Search "Inception" → Add | Movie added to list | [ ] |
| 1.2 | Browse → Movies → Search "The Matrix" → Add | Movie added to list | [ ] |
| 1.3 | Browse → Movies → Search "Interstellar" → Add | Movie added to list | [ ] |
| 1.4 | Browse → TV → Search "Breaking Bad" → Add | TV show added | [ ] |
| 1.5 | Browse → TV → Search "The Office" → Add | TV show added | [ ] |
| 1.6 | Browse → TV → Search "Stranger Things" → Add | TV show added | [ ] |
| 1.7 | Browse → Books → Search "Dune" → Add | Book added | [ ] |
| 1.8 | Browse → Books → Search "1984" → Add | Book added | [ ] |
| 1.9 | Browse → Books → Search "The Hobbit" → Add | Book added | [ ] |
| 1.10 | Browse → Games → Search "Elden Ring" → Add | Game added | [ ] |
| 1.11 | Browse → Games → Search "Zelda" → Add | Game added | [ ] |
| 1.12 | Browse → Games → Search "God of War" → Add | Game added | [ ] |
| 1.13 | Browse → Music → Search "Thriller" → Add | Album added | [ ] |
| 1.14 | Browse → Music → Search "Abbey Road" → Add | Album added | [ ] |
| 1.15 | Browse → Music → Search "Dark Side of the Moon" → Add | Album added | [ ] |

### Test 2: Search and Add from Category
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 2.1 | Go to Browse page | Category grid visible | [ ] |
| 2.2 | Click "Movies" category | Add Item modal opens | [ ] |
| 2.3 | Search "Gladiator" | Results appear | [ ] |
| 2.4 | Click Add on first result | Toast: "Added to list" | [ ] |
| 2.5 | View list | "Gladiator" visible in list | [ ] |

### Test 3: Quick Add & Suggestions
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 3.1 | Go to Dashboard | "Suggested for you" cards visible | ✅ |
| 3.2 | Click + on suggestion | Quick Add modal opens | ✅ |
| 3.3 | Select List -> Add | Item added + Toast success | ✅ |
| 3.4 | Go to Category Page | Curated items visible | ✅ |
| 3.5 | Check "Added" state | Items already owned show checkmark | ✅ |
| 3.6 | Try adding again | Toast: "Already in list" | ✅ |

### Test 4: Create a List
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 4.1 | Click "Create List" in sidebar | Modal opens | [ ] |
| 4.2 | Enter name "Test List" → Submit | List created | [ ] |
| 4.3 | Check sidebar | "Test List" appears | [ ] |
| 4.4 | Click "Test List" | List page loads (empty) | [ ] |

### Test 5: Delete a List
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 5.1 | Navigate to "Test List" | List page loads | [ ] |
| 5.2 | Click "Delete List" button | Confirmation dialog | [ ] |
| 5.3 | Confirm deletion | Redirects to Dashboard | [ ] |
| 5.4 | Check sidebar | "Test List" gone | [ ] |

### Test 6: Remove Item from List
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 6.1 | Navigate to Master List | Items visible | [ ] |
| 6.2 | Click trash icon on an item | Confirmation dialog | [ ] |
| 6.3 | Confirm deletion | Item removed | [ ] |
| 6.4 | Refresh page | Item still gone | [ ] |

---


---

## Sprint 12: Production Hardening 🔒

### 12.1 Error Boundaries
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Error fallback | Trigger error in component | Friendly error message shows | [ ] |
| Retry button | Click "Try Again" | Component resets | [ ] |
| Error isolation | Error in list page | Rest of app works | [ ] |
| No stack trace | View error message | No internal paths exposed | [ ] |

### 12.2 Loading States
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Skeleton cards | Throttle network (Slow 3G) | Skeleton cards visible | [ ] |
| Page transitions | Navigate between pages | No blank content flash | [ ] |
| Spinner a11y | Inspect loading spinner | Has aria-label | [ ] |

### 12.3 Image Optimization
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Blur placeholder | Slow connection | Blur shows before image | [ ] |
| Broken image | Invalid image URL | Fallback icon displays | [ ] |
| Lazy loading | Scroll down | Below-fold images load on scroll | [ ] |

### 12.4 SEO
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Meta tags | View page source | Title, description present | [ ] |
| OG preview | Share link on Discord | Preview renders correctly | [ ] |
| Sitemap | Visit `/sitemap.xml` | Public lists included | [ ] |
| Private excluded | Check sitemap | Private lists NOT in sitemap | [ ] |

---

## Sprint 13: Friend List Comparison 🔄
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Navigate to compare | Friends → Click Compare | Compare page loads | [ ] |
| Shared items | Both have same item | Shows in "Shared" column | [ ] |
| Only me items | I have, friend doesn't | Shows in "Only You" column | [ ] |
| Only friend items | Friend has, I don't | Shows in "Only [Friend]" column | [ ] |
| Match percentage | View header | Jaccard similarity displayed | [ ] |
| Empty state | No shared items | "No shared items yet!" | [ ] |
| Unauthorized | Compare with non-friend | 401 error | [ ] |

---

## Sprint 14: Enhanced Search 🔎
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Open with ⌘K | Press ⌘K (Ctrl+K) | Search dialog opens | [ ] |
| Close with Escape | Press Escape | Dialog closes | [ ] |
| Basic search | Type "matrix" | Matching items appear | [ ] |
| Debounce | Type quickly | Only one request after pause | [ ] |
| Category filter | Select "Movies" | Only movies shown | [ ] |
| Status filter | Select "Completed" | Only completed shown | [ ] |
| Keyboard nav | Arrow down/up | Selection moves | [ ] |
| Select with Enter | Press Enter on item | Navigates to item | [ ] |
| Recent searches | Reopen dialog | Recent searches shown | [ ] |
| XSS prevention | Type `<script>` | No injection | [ ] |

---

## Sprint 15: User Profiles 👤
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| View public profile | Navigate to `/user/[username]` | Profile renders | [ ] |
| View private profile | Navigate to private user | "Profile not public" | [ ] |
| Non-existent user | Navigate to fake username | 404 page | [ ] |
| Edit username | Settings → Change username | URL changes | [ ] |
| Edit bio | Settings → Update bio | Persisted | [ ] |
| Add Friend | Click "Add Friend" on profile | Request sent toast | [ ] |
| Username validation | Try `ab` (too short) | Validation error | [ ] |
| XSS in bio | Enter `<script>` in bio | Sanitized | [ ] |

---

## Sprint 16: Notifications 🔔
| Test | Action | Expected | Status |
|------|--------|----------|--------|
| Receive notification | Friend sends request | Notification appears | [ ] |
| Unread badge | Have unread notifications | Red badge on bell | [ ] |
| Open dropdown | Click bell icon | Notifications listed | [ ] |
| Mark as read | Open dropdown | Notifications marked read | [ ] |
| Navigate from notification | Click notification | Goes to relevant page | [ ] |
| Empty state | No notifications | "No new notifications" | [ ] |
| Friend accepted | Friend accepts request | Notification received | [ ] |
| Rate limit | Create many notifications | Rate limited | [ ] |

---

## Security Checklist 🔐
| Check | Area | Status |
|-------|------|--------|
| Session validation | All API endpoints | ✅ |
| Input sanitization | Search, bio, username | [ ] |
| Rate limiting | Notifications, search, profile updates | [ ] |
| Private data protection | Private lists, profiles | [ ] |
| XSS prevention | All user inputs | [ ] |
| CSRF protection | Mutation endpoints | ✅ |

