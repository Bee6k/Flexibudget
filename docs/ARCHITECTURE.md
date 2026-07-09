# FlexiBudget Architecture

## System overview

FlexiBudget is a full-stack financial planning application (capstone project). Users register, complete onboarding by life archetype, manage expenses/income on the server, and view allocation, runway, and recommendations on the dashboard.

| Layer | Technology | Port |
|-------|------------|------|
| Frontend | React 18, Vite, MUI, Recharts | 5173 |
| Backend | Express 4, Sequelize 6 | 5000 |
| Database | MySQL 8 | 3306 |

Currency: **NPR** (Nepalese Rupee).

---

## Architecture diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                             │
│  ThemeProvider → BrowserRouter → AuthProvider                    │
│       → PrivateRoute → FinanceProvider → NotificationProvider    │
│       → AppShell → Pages                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS-ish (dev: HTTP)
                             │ Axios withCredentials + X-CSRF-Token
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express API (server.js)                      │
│  helmet → cors → cookieParser → json → rateLimit → csrf          │
│  /api/auth | expenses | incomes | users | dashboard | ...      │
└────────────────────────────┬────────────────────────────────────┘
                             │ Sequelize
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MySQL                                    │
│  users | expenses | incomes | expense_categories                 │
│  goals | subscriptions | investments | schema_migrations       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request lifecycle

```
1. Browser sends request (cookie auto-attached)
2. CORS validates origin (CLIENT_ORIGIN)
3. Rate limiter checks quota
4. CSRF middleware validates mutating requests (POST/PUT/DELETE)
5. Route handler runs express-validator rules
6. requireAuth reads JWT from HttpOnly cookie (or Bearer in tests)
7. Controller loads user-scoped data (user_id filter)
8. Service layer runs business algorithms
9. JSON response returned; 401 triggers frontend force logout
```

---

## Module dependency map

### Backend

```
server.js
├── middleware/     auth, csrf, rateLimit, validate
├── routes/         thin HTTP wiring + validation rules
├── controllers/    request orchestration, IDOR-safe lookups
├── services/       allocation, horizon, crisis, recommendations
├── models/         Sequelize entities + associations
├── utils/          finance math, auth cookies, migrations, serializers
└── migrations/     schema changes (ENUM fix, user data tables)
```

### Frontend

```
App.jsx
├── context/
│   ├── AuthContext      session bootstrap, login/logout
│   ├── FinanceContext   dashboard data, sandbox mode
│   ├── NotificationContext  reminders from expenses + subscriptions
│   └── ThemeContext     light/dark preference
├── services/api.js    Axios + CSRF + 401 handler
├── pages/             route-level UI
└── components/        reusable UI, onboarding wizard, charts
```

---

## Core business logic (algorithm pipeline)

```
User.current_balance + Expenses + Incomes
              │
              ▼
    allocationService.calculateAllocation()
    ── Waterfall: tier 1→4, FUNDED | PARTIAL | UNFUNDED
              │
              ▼
    horizonService.simulateHorizon()
    ── Daily simulation: balance += income, balance -= daily_burn
    ── daily_burn = sum(toMonthly(expenses)) / 30
              │
              ▼
    crisisService.evaluateCrisisState()
    ── NORMAL (>30 days) | CAUTION (7–30) | CRISIS (<7)
              │
              ▼
    recommendationService.generateRecommendations()
    ── If not NORMAL: suggest cutting tier-4 expenses
```

**Business rule:** `one-time` expenses contribute **0** to recurring monthly burn (`utils/finance.js` → `toMonthly`). They still exist as expense records but do not inflate daily burn.

---

## User flow

```
Register → Login (cookie set) → Onboarding wizard (optional)
    → Bulk create expenses from archetype presets
    → Set balance + income
    → Dashboard (allocation + horizon + crisis)
    → Manage expenses/income/goals/subscriptions/investments
    → Notifications (7-day and 1-day reminders)
    → Advise page (recommendations when in CAUTION/CRISIS)
```

---

## Deployment flow (current)

```
1. MySQL: create database + user
2. backend/.env: DB creds, JWT_SECRET (32+ chars), CLIENT_ORIGIN
3. npm run server  → sync + migrations + seed presets
4. frontend: npm run dev (VITE_API_URL optional)
```

No Docker/CI in repo today. Migrations run automatically on backend startup.

---

## Data ownership

| Data | Storage | Scoped by |
|------|---------|-----------|
| Expenses, incomes, balance | MySQL | user_id |
| Goals, subscriptions, investments | MySQL | user_id |
| Auth session | HttpOnly cookie | JWT sub = user.id |
| Dismissed notification IDs | localStorage | browser only |
| Theme preference | localStorage | browser only |

---

## Maintainer: high-impact modules

| Module | If changed, retest |
|--------|-------------------|
| `utils/finance.js` | Allocation, horizon, dashboard, recommendations |
| `services/horizonService.js` | Crisis state, notifications, advise |
| `middleware/auth.js` + `authController.js` | All protected routes |
| `middleware/csrf.js` | All POST/PUT/DELETE from frontend |
| `FinanceContext.jsx` | Every dashboard/finance page |
