# Maintainer Notes

For engineers responsible for long-term upkeep, production readiness, and release decisions.

---

## Safe to modify (low regression risk)

| Area | Examples |
|------|----------|
| UI copy / labels | `utils/copy.js`, page subtitles |
| Navigation | `config/navigation.js` |
| Theme colors | `theme/financialColors.js`, `flexiTheme.js` |
| New read-only API fields | Add to serializers with tests |
| Documentation | `docs/`, README |
| New preset categories | `models/index.js` PRESET_CATEGORIES + seed |
| Frontend page layout | MUI styling without changing data flow |

---

## Modify with caution (medium regression)

| Area | Required testing |
|------|------------------|
| New API endpoints | Auth scope, validation, CSRF, Supertest |
| Expense/income forms | CRUD + dashboard refresh |
| Notification rules | `notifications.js` + NotificationContext |
| Onboarding steps | Full wizard E2E manually |
| Migrations | Backup DB first; test on copy |

---

## Never modify without full review (high regression)

| Area | Why |
|------|-----|
| `middleware/auth.js` | Authentication bypass risk |
| `middleware/csrf.js` | CSRF vulnerability |
| `utils/finance.js` → `toMonthly()` | Breaks allocation, horizon, recommendations |
| `services/allocationService.js` | Core waterfall logic |
| `services/horizonService.js` | Crisis state depends on this |
| `services/crisisService.js` | Threshold changes affect all alerts |
| `utils/authCookie.js` | Session security |
| `config/jwt.js` | Token forgery if weakened |
| IDOR query patterns | Must always filter by `user_id` |

**Regression suite for algorithm changes:**
```bash
cd backend && npm test
# Must pass: finance.test.js, allocation.test.js, expenses.test.js
```

---

## Hidden risks

### 1. One-time expenses in horizon
`toMonthly('one-time')` returns 0 for burn rate, but one-time due dates do not create horizon spikes. Users with large one-off bills may see optimistic runway.

### 2. Daily burn approximation
Horizon uses `monthlyTotal / 30` — not calendar-accurate for weekly/yearly frequencies.

### 3. CSRF skipped in tests only
Do not propagate `NODE_ENV=test` to production.

### 4. Never re-enable sync() on startup
Schema is owned by `migrations/` only. `sequelize.sync()` previously created duplicate email indexes and foreign keys. Tests may still use `sync({ force: true })` against a `*test*` database name — that is intentional and isolated.

### 5. localStorage migration
Goals/subscriptions/investments pages migrate old localStorage once. Duplicate migration if server cleared but localStorage remains is unlikely but possible.

### 6. Legacy dashboard removed

Legacy `Dashboard.jsx` and its exclusive components (`Layout`, `BurnDownChart`, `BalanceDisplay`, `CrisisBanner`) were deleted. Active dashboard is `ExecutiveDashboard.jsx`.

---

## Deployment checklist

- [ ] Strong `JWT_SECRET` (32+ random chars)
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_ORIGIN` set to production frontend URL
- [ ] HTTPS enabled (required for secure cookies)
- [ ] MySQL backups configured
- [ ] Run `npm test` in CI before deploy
- [ ] Manual smoke: register → login → dashboard → logout

---

## Adding a new user-owned entity

1. Create model in `backend/models/`
2. Add association in `models/index.js`
3. Create migration in `migrations/`
4. Controller with `findOwned*` pattern
5. Routes with `requireAuth` + express-validator
6. Register route in `server.js`
7. Frontend service + page
8. Supertest CRUD tests in `tests/`
9. Update `docs/API.md` and `docs/DATABASE.md`

---

## Performance notes

- Dashboard loads all expenses/incomes — acceptable at capstone scale
- No pagination on list endpoints — add before 10k+ rows per user
- Frontend bundle ~1MB — consider lazy routes for production
- Add DB indexes if slow: `expenses(user_id)`, `incomes(user_id, expected_date)`

---

## Test coverage map

| File | Covers |
|------|--------|
| `tests/auth.test.js` | Cookie login/logout/verify |
| `tests/expenses.test.js` | Expense CRUD + dashboard |
| `tests/finance.test.js` | toMonthly unit tests |
| `tests/allocation.test.js` | One-time burn exclusion, presets |
| `tests/userData.test.js` | Goals, subscriptions, investments |

**Gaps:** horizon service, crisis thresholds, recommendation ranking, frontend E2E.

---

## Version / dependency notes

- React pinned to 18 for MUI v5 compatibility
- Vite 5 (not 8) for Node 20.18 support
- Sequelize 6 — do not upgrade to v7 without migration guide review

---

## Contact / ownership

Capstone project — document changes in commit messages. For architectural decisions, update `docs/ARCHITECTURE.md` in the same PR.
