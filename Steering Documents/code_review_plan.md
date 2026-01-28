# Code Review & Testing Strategy

> Comprehensive plan for auditing MyBacklog codebase and implementing testing

---

## Phase 1: Design Patterns Review 📚

### Key Patterns to Verify

| Pattern | Where Used | What to Check |
|---------|-----------|---------------|
| **Strategy** | `item-strategy.ts` | Each category has own strategy |
| **Factory** | `SearchContext` | Creates strategy instances |
| **Repository** | DB queries | Encapsulated data access |
| **Observer** | React state | Proper useEffect cleanup |
| **Singleton** | DB connection | Single instance shared |
| **Facade** | API routes | Hide internal complexity |

### SOLID Principles Checklist

- [ ] **S**ingle Responsibility: Each component/function does one thing
- [ ] **O**pen/Closed: Extend via new strategies, not modification
- [ ] **L**iskov Substitution: Strategies are interchangeable
- [ ] **I**nterface Segregation: Small, focused interfaces
- [ ] **D**ependency Inversion: Depend on abstractions

---

## Phase 2: Code Review Checklist 🔍

### 2.1 Common Bug Patterns

| Bug Type | What to Look For | Priority |
|----------|-----------------|----------|
| Race conditions | Missing `await`, parallel state updates | 🔴 High |
| Memory leaks | Missing cleanup in useEffect | 🔴 High |
| Null pointer | Missing optional chaining | 🟡 Medium |
| Type coercion | `==` instead of `===` | 🟡 Medium |
| Stale closures | Missing deps in useEffect/useCallback | 🔴 High |
| N+1 queries | Loop with DB calls | 🔴 High |
| XSS vulnerabilities | Unsafe dangerouslySetInnerHTML | 🔴 High |
| SQL injection | Raw string interpolation | 🔴 High |

### 2.2 Obscure Bug Patterns

| Bug Type | What to Look For |
|----------|-----------------|
| Floating point | Price/rating calculations |
| Time zone issues | Date comparisons without TZ |
| Unicode edge cases | String length/substring |
| Integer overflow | Large counts |
| JSON parsing errors | Unhandled parse failures |

### 2.3 Performance Optimizations

| Area | What to Check |
|------|---------------|
| Re-renders | Missing React.memo, useMemo |
| Bundle size | Large imports, tree shaking |
| API calls | Duplicate fetches, caching |
| Images | Missing lazy loading, sizing |
| Database | Index usage, query efficiency |

---

## Phase 3: Files to Review 📁

### Priority 1: Critical Path (Security/Data)
1. `src/app/api/**/route.ts` — All API endpoints
2. `src/auth.ts` — Authentication config
3. `src/lib/db/schema.ts` — Database schema
4. `src/lib/strategies/*.ts` — Business logic

### Priority 2: Core Components
1. `src/components/Autocomplete.tsx` — Search/add flow
2. `src/components/FilteredList.tsx` — List display
3. `src/components/SearchDialog.tsx` — Global search
4. `src/components/NotificationBell.tsx` — Real-time

### Priority 3: Pages
1. `src/app/(dashboard)/dashboard/page.tsx`
2. `src/app/(dashboard)/lists/[id]/page.tsx`
3. `src/app/(dashboard)/friends/page.tsx`

---

## Phase 4: Testing Strategy 🧪

### 4.1 Unit Tests (Jest + React Testing Library)

| Component | Tests Needed |
|-----------|-------------|
| `Button` | Variants, disabled state, click |
| `Card` | Variants, children rendering |
| `Badge` | Variants, text display |
| `Input` | Value, onChange, validation |
| `SearchDialog` | ⌘K trigger, results, selection |
| `NotificationBell` | Badge count, mark read |

### 4.2 Integration Tests

| Flow | Steps |
|------|-------|
| Add Item | Open autocomplete → Search → Select → Confirm |
| Create List | Click new → Enter name → Save |
| Delete List | Click delete → Confirm → Verify gone |
| Friend Request | Search user → Send → Accept/Reject |
| Item Reorder | Drag item → Drop → Verify persisted |

### 4.3 Regression Tests

| Feature | Edge Cases |
|---------|-----------|
| Login | Wrong password, expired session |
| Search | Empty query, special chars, no results |
| Lists | Empty list, 100+ items, long names |
| Friends | Self-request, duplicate, revoked |

### 4.4 E2E Tests (Playwright/Cypress)

| Critical Path | Priority |
|--------------|----------|
| Sign up → Create list → Add item → Complete | 🔴 P0 |
| Login → Search → Add from results | 🔴 P0 |
| Share list → View as guest | 🟡 P1 |
| Friend request flow | 🟡 P1 |
| Notification interaction | 🟢 P2 |

---

## Execution Order

1. **Review code** (Phases 1-3)
   - Priority 1 files first
   - Document issues in new `code_review.md`
   - Fix critical bugs immediately

2. **Set up testing** (Phase 4)
   - Install Jest + RTL
   - Create test utilities
   - Write priority unit tests

3. **Integration tests**
   - Test API endpoints
   - Test component interactions

4. **E2E tests**
   - Install Playwright
   - Write P0 tests first

---

## Success Criteria

- [ ] All Priority 1 files reviewed
- [ ] No 🔴 High priority bugs remaining
- [ ] Unit test coverage > 60% on components
- [ ] All P0 E2E tests passing
- [ ] Documentation updated

---

## Files to Create

| File | Purpose |
|------|---------|
| `code_review.md` | Audit findings |
| `jest.config.js` | Test configuration |
| `src/__tests__/` | Test files |
| `playwright.config.ts` | E2E configuration |
