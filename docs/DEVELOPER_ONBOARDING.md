# Developer Onboarding Guide

Goal: Understand FlexiBudget architecture, run it locally, and make your first safe change within one day.

---

## Day 1 checklist

### Morning — Setup (1–2 hours)

- [ ] Install Node 18+, MySQL 8 (XAMPP works on Windows)
- [ ] Clone/extract project to `bishal_ug/bishal_ug/`
- [ ] Create MySQL database `flexibudget` and user
- [ ] Copy `backend/.env.example` → `backend/.env`
- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- [ ] Start backend: `cd backend && npm install && npm run server`
- [ ] Start frontend: `cd frontend && npm install && npm run dev`
- [ ] Register a test account at http://localhost:5173/register
- [ ] Complete onboarding wizard

### Midday — Read (2 hours)

1. [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — system design
2. [docs/AUTHENTICATION.md](./AUTHENTICATION.md) — how sessions work
3. [docs/DATABASE.md](./DATABASE.md) — models and relationships
4. [docs/API.md](./API.md) — endpoint reference
5. Skim `backend/services/allocationService.js` — core algorithm

### Afternoon — Explore (2 hours)

- [ ] Set a breakpoint or `console.log` in `dashboardController.getDashboard`
- [ ] Add an expense in UI → watch POST `/api/expenses`
- [ ] Run tests: `cd backend && npm test`
- [ ] Read `frontend/src/context/FinanceContext.jsx`

### End of day — First change

Safe starter tasks:
- Update copy in `frontend/src/utils/copy.js`
- Add a navigation label in `config/navigation.js`
- Add a unit test in `backend/tests/finance.test.js`

Avoid on day 1:
- Auth middleware
- CSRF logic
- `toMonthly()` / horizon simulation

---

## Repository layout

```
bishal_ug/
├── docs/              ← You are here
├── backend/
│   ├── server.js      ← Start here for API
│   ├── models/        ← Database entities
│   ├── services/      ← Business algorithms
│   ├── controllers/   ← HTTP handlers
│   ├── routes/        ← URL + validation
│   ├── middleware/    ← Auth, CSRF, rate limits
│   └── tests/         ← Jest + Supertest
└── frontend/
    └── src/
        ├── App.jsx      ← Routes
        ├── context/     ← Global state
        ├── pages/       ← Screens
        ├── services/    ← API client
        └── components/  ← Reusable UI
```

---

## Common commands

```bash
# Backend
cd backend
npm run server      # dev with nodemon
npm test            # all tests
npm run migrate     # migrations only

# Frontend
cd frontend
npm run dev         # Vite dev server
npm run build       # production build
```

---

## Debugging tips

| Problem | Check |
|---------|-------|
| 401 on all requests | Cookie not sent — verify `withCredentials`, CORS `credentials: true`, same CLIENT_ORIGIN |
| 403 on POST | CSRF — call GET `/auth/csrf` first; check X-CSRF-Token header |
| ECONNREFUSED MySQL | Start XAMPP/MySQL |
| CORS error | `CLIENT_ORIGIN` must match frontend URL exactly |
| Stale session | Clear cookies, re-login |

---

## Code conventions

- **Backend:** CommonJS (`require`), async/await, controllers throw `err.status` for 404
- **Frontend:** ES modules, functional components, MUI for UI
- **Currency:** NPR via `utils/currency.js` → `formatCurrency()`
- **Tiers:** 1–4 internally; customer labels in `utils/copy.js`

---

## Who to ask / what to read

| Question | Document |
|----------|----------|
| How does login work? | AUTHENTICATION.md |
| What tables exist? | DATABASE.md |
| What does this endpoint expect? | API.md |
| Can I change this safely? | MAINTAINER.md |
| Security implications? | SECURITY.md |

---

## Next steps after day 1

1. Trace onboarding: `OnboardingWizard.jsx` → bulk expenses API
2. Trace dashboard: `FinanceContext` → `GET /dashboard` → services pipeline
3. Add integration test for a new endpoint following `tests/expenses.test.js` pattern
