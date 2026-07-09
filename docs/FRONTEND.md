# FlexiBudget Frontend Documentation

Stack: React 18 · Vite · MUI v5 · React Router v6 · Axios · Recharts

---

## Application shell

```
ThemeProvider (light/dark)
  └── BrowserRouter
        └── AuthProvider (session)
              └── Routes
                    ├── /login, /register (public)
                    └── PrivateRoute
                          └── FinanceProvider
                                └── NotificationProvider
                                      └── AppShell (Sidebar + TopBar)
                                            └── Page routes
```

**Entry:** `src/main.jsx` → `App.jsx`

---

## State management

| Context | File | Responsibility |
|---------|------|----------------|
| AuthContext | `context/AuthContext.jsx` | User session, login/logout, bootstrap verify |
| FinanceContext | `context/FinanceContext.jsx` | Dashboard data, sandbox mode, refresh |
| NotificationContext | `context/NotificationContext.jsx` | Reminders, dismissals, browser notifications |
| ThemeContext | `context/ThemeContext.jsx` | MUI theme mode (localStorage) |

**FinanceContext state:**
- `live` — raw API dashboard + incomes
- `view` — live or sandbox-derived metrics
- `sandbox` — what-if scenario copy
- `recommendations` — loaded when crisis ≠ NORMAL

---

## API layer

| File | Purpose |
|------|---------|
| `services/api.js` | Axios instance, CSRF, 401 handler, credentials |
| `services/auth.js` | login, logout, verify, csrf |
| `services/expenses.js` | Expense CRUD + bulk |
| `services/incomes.js` | Income CRUD |
| `services/dashboard.js` | Dashboard aggregate |
| `services/goals.js` | Goals CRUD |
| `services/subscriptions.js` | Subscriptions CRUD |
| `services/investments.js` | Investments CRUD |
| `services/users.js` | Profile, balance, onboarding |
| `services/presets.js` | Archetype presets |

---

## Pages

### Public

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | LoginPage | Email/password login |
| `/register` | RegisterPage | Account creation + auto login |

### Core finance

| Route | Page | Purpose | APIs |
|-------|------|---------|------|
| `/dashboard` | ExecutiveDashboard | KPIs, charts, crisis banner | FinanceContext |
| `/budget` | BudgetPlannerPage | Tier budget view | FinanceContext |
| `/expenses` | ExpenseManagerPage | Expense CRUD | expenses API |
| `/income` | IncomeManagerPage | Income CRUD | incomes API |
| `/transactions` | TransactionsPage | Combined transaction view | FinanceContext |
| `/calendar` | FinancialCalendarPage | Due dates calendar | expenses, incomes |

### Planning & tracking

| Route | Page | Purpose | Storage |
|-------|------|---------|---------|
| `/goals` | GoalsPage | Savings targets | Server API (+ localStorage migration) |
| `/subscriptions` | SubscriptionsPage | Recurring bills | Server API |
| `/investments` | InvestmentsPage | Portfolio tracking | Server API |
| `/emergency-fund` | EmergencyFundPage | Emergency fund focus | FinanceContext |

### Insights

| Route | Page | Purpose |
|-------|------|---------|
| `/advise` | AIInsightsPage | Recommendations when runway low |
| `/analytics` | AnalyticsPage | Charts and metrics |
| `/predictions` | PredictionsPage | Horizon projections |
| `/reports` | ReportsPage | Export views |

### Settings

| Route | Page | Purpose |
|-------|------|---------|
| `/settings` | SettingsPage | Notification preferences |
| `/profile` | ProfilePage | User info, logout |

---

## Onboarding

**Component:** `components/onboarding/OnboardingWizard.jsx`  
**Triggered from:** `AppShell` when `user.onboarding_completed === false`

Flow:
1. Choose archetype (student, freelancer, businessman, worker)
2. Review/adjust tier expenses from presets
3. Set balance + income
4. Bulk POST `/expenses/bulk` + PUT `/users/onboarding`

**Config:** `config/onboarding.js` — steps, tier labels, archetype metadata

---

## Key reusable components

| Component | Purpose | Key props |
|-----------|---------|-------------|
| `PrivateRoute` | Auth gate | uses AuthContext |
| `AppShell` | Layout shell | `<Outlet />` for pages |
| `PageHeader` | Page title bar | title, subtitle, action |
| `CrisisBanner` | *(removed — crisis UI inlined in ExecutiveDashboard)* | |
| `TierCard` | Tier allocation display | tier data |
| `FinanceCharts` | Recharts wrappers | tiers, horizon data |
| `NotificationMenu` | Bell dropdown | NotificationContext |
| `OnboardingWizard` | Full-screen setup | user, setUser |
| `ExpenseForm` / `ExpenseList` | Expense UI | CRUD callbacks |

---

## Notifications

**Builder:** `utils/notifications.js`

Sources:
1. Monthly expenses with `due_date` → 7-day and 1-day reminders
2. Subscriptions from API → billing day reminders
3. Crisis state from FinanceContext → system alert

Dismissals stored in `localStorage` (`flexibudget_dismissed_notifications`).

---

## Navigation

**Config:** `config/navigation.js` — sidebar links and labels  
**Icons:** `config/navIcons.js`

Customer-facing tier names:
- Tier 1: Essentials
- Tier 2: Stability
- Tier 3: Goals
- Tier 4: Lifestyle

---

## Legacy / removed

The following legacy files were removed during cleanup (superseded by `ExecutiveDashboard` + `AppShell` + `FinanceCharts`):

- `pages/Dashboard.jsx`
- `components/Layout.jsx`
- `components/BurnDownChart.jsx`
- `components/BalanceDisplay.jsx`
- `components/CrisisBanner.jsx`

---

## User actions by page (summary)

**ExecutiveDashboard:** View allocation, horizon, crisis; open sandbox; quick-add expense  
**ExpenseManagerPage:** Add/edit/delete expenses by tier  
**GoalsPage:** Create savings goals  
**SubscriptionsPage:** Add/remove subscriptions (feeds notifications)  
**SettingsPage:** Enable browser notification permission  

---

## Styling

- `theme/flexiTheme.js` — MUI theme creation
- `theme/financialColors.js` — tier colors, chart palette
- `App.css`, `index.css` — global styles
