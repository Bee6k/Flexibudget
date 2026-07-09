# Code Cleanup Report — FlexiBudget

**Date:** June 2026  
**Scope:** Dead code removal and unused export cleanup  
**Behavior change:** None — all 26 backend tests pass, frontend build succeeds

---

## Phase 1–2: Scan summary

| Category | Count |
|----------|-------|
| **USED** | 77 frontend source files, 47 backend source files (excl. node_modules) |
| **DEFINITELY UNUSED** | 5 frontend files (legacy dashboard subtree) |
| **POSSIBLY UNUSED** | 1 route stub (`/onboarding` → empty Box; kept — AppShell uses pathname) |
| **Backend orphan files** | 0 |

---

## Removed files (5)

| File | Lines (approx) | Proof |
|------|----------------|-------|
| `frontend/src/pages/Dashboard.jsx` | ~290 | Never imported; `/dashboard` routes to `ExecutiveDashboard` |
| `frontend/src/components/Layout.jsx` | ~40 | Only imported by deleted Dashboard |
| `frontend/src/components/BalanceDisplay.jsx` | ~55 | Only imported by deleted Dashboard |
| `frontend/src/components/BurnDownChart.jsx` | ~42 | Only imported by deleted Dashboard |
| `frontend/src/components/CrisisBanner.jsx` | ~30 | Only imported by deleted Dashboard |

**Total files removed:** 5  
**Estimated lines removed:** ~460

---

## Removed functions / exports

### Frontend

| Removed | File | Reason |
|---------|------|--------|
| `fetchCsrf` | `services/auth.js` | CSRF handled in `api.js` |
| `getAllocation`, `getHorizon` | `services/dashboard.js` | Never imported |
| `listExpenses` | `services/expenses.js` | Never imported |
| `getProfile` | `services/users.js` | Never imported |
| `updateGoal` | `services/goals.js` | Never imported |
| `updateSubscription` | `services/subscriptions.js` | Never imported |
| `updateInvestment` | `services/investments.js` | Never imported |
| `getSubscriptions`, `getInvestments`, `saveInvestments`, `purgeDemoInvestments` | `utils/localData.js` | Subscriptions/investments now server-backed |
| `DashboardSkeleton` | `components/ui/PageHeader.jsx` | Never imported |
| `priorityLabel`, `TIER_NAMES` re-exports | `utils/financeMetrics.js` | Consumers import from `copy.js` / `algorithms.js` |
| `setMode` from context value | `context/ThemeContext.jsx` | Never used by consumers |

### Backend

| Removed | File | Reason |
|---------|------|--------|
| `groupExpensesByTier` re-export | `controllers/expenseController.js` | Used from `serializeExpense.js` directly in dashboardController |
| `AUTH_COOKIE` export | `utils/authCookie.js` | Internal constant only |
| `CSRF_COOKIE`, `CSRF_HEADER` exports | `middleware/csrf.js` | Internal constants only |

---

## Duplicate logic — not consolidated (manual review)

These duplicates were **identified but not refactored** to avoid regression risk:

| Area | Recommendation |
|------|----------------|
| `findOwned*` in 5 controllers | Extract to shared util in future PR |
| Goal/Subscription/Investment CRUD controllers | Generic CRUD factory candidate |
| Serialize utilities (4 files) | Shared field-map serializer |
| Thin analytics route files (4×) | Merge into single router |
| Monthly expense aggregation in allocation + horizon | Shared helper in `utils/finance.js` |

---

## Dependencies

| Package | Action |
|---------|--------|
| All backend `dependencies` | **Kept** — all used (mysql2 via Sequelize dialect) |
| All frontend `dependencies` | **Kept** — MUI requires @emotion peers; recharts used by FinanceCharts |

No npm packages removed.

---

## Performance

| Item | Action |
|------|--------|
| Dead file removal | No bundle size change (files were never imported) |
| Unused export removal | Slightly cleaner tree-shaking surface |
| Context `setMode` removal | Negligible |
| Lazy routes / memoization | **Deferred** — behavior-sensitive; recommend separate PR |

---

## Database / API

- No tables, models, migrations, or endpoints removed
- All active API routes unchanged

---

## Regression validation

| Check | Result |
|-------|--------|
| `npm test` (backend) | ✅ 26/26 pass |
| `npm run build` (frontend) | ✅ Success |
| Routes | ✅ `/dashboard` → ExecutiveDashboard |
| Auth | ✅ Cookie tests pass |

---

## Manual review items (kept intentionally)

1. **`/onboarding` route** — renders empty `<Box />`; wizard shown by `AppShell` when pathname matches. Functional but could be simplified in a future UX pass.
2. **Backend CRUD consolidation** — high value, medium risk; needs dedicated refactor + tests.
3. **Route lazy-loading** — would reduce bundle; separate performance task.
4. **`update*` API service wrappers** — removed from frontend; backend PUT endpoints remain for future edit UIs.

---

## Risk assessment

**Overall risk:** Low — only provably unreferenced code removed.

**Areas requiring attention if extended:**
- Re-adding goal/subscription/investment edit UI will need new `update*` service functions
- Do not restore deleted Dashboard without re-wiring routes
