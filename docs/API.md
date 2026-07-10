# FlexiBudget API Reference

Base URL: `http://localhost:5000/api`  
Auth: HttpOnly cookie `flexibudget_token` (or `Authorization: Bearer` in tests)  
CSRF: Required on POST/PUT/DELETE — header `X-CSRF-Token` must match cookie `flexibudget_csrf`  
Get CSRF token: `GET /auth/csrf`

---

## Health

### GET /health

| | |
|---|---|
| **Purpose** | Liveness + database connectivity |
| **Auth** | NO |
| **Response** | `{ "status": "ok", "database": "up" }` (or `"down"` if DB unreachable) |

---

## Authentication

### GET /auth/csrf

| | |
|---|---|
| **Purpose** | Issue CSRF token for mutating requests |
| **Auth** | NO |
| **Response** | `{ "csrfToken": "..." }` |
| **Side effect** | Sets `flexibudget_csrf` cookie |

### POST /auth/register

| | |
|---|---|
| **Purpose** | Create account |
| **Auth** | NO |
| **Rate limit** | 10 / 15 min |
| **Body** | `{ name, email, password }` — password 8–128 chars |
| **Response 201** | `{ message, user }` — no token in body |
| **Errors** | 409 duplicate email, 400 validation |

### POST /auth/login

| | |
|---|---|
| **Purpose** | Authenticate and start session |
| **Auth** | NO |
| **Rate limit** | 10 / 15 min |
| **Body** | `{ email, password }` |
| **Response 200** | `{ user }` + Set-Cookie `flexibudget_token` |
| **Errors** | 401 invalid credentials |

**Side effect:** Auto-sets `onboarding_completed` if user already has expenses.

### POST /auth/logout

| | |
|---|---|
| **Purpose** | Clear session cookie |
| **Auth** | NO (clears cookie if present) |
| **Response** | `{ message: "Logged out." }` |

### GET /auth/verify

| | |
|---|---|
| **Purpose** | Validate session and return current user |
| **Auth** | YES |
| **Response** | `{ user }` serialized (no password_hash) |
| **Errors** | 401 |

---

## Users

All require auth.

### GET /users/profile

Returns `{ user }` — same as verify payload.

### PUT /users/balance

| **Body** | `{ current_balance }` — float ≥ 0 |
| **Response** | `{ user }` |

**Business rule:** Balance drives waterfall allocation and horizon starting point.

### PUT /users/onboarding

| **Body** | `{ onboarding_completed?: boolean, archetype?: enum }` |
| **Archetype whitelist** | student, freelancer, family, businessman, worker |

---

## Expenses

All require auth. Scoped to `req.user.id`.

### GET /expenses

| **Query** | `tier` (optional, 1–4) |
| **Response** | Array of expense objects |

### POST /expenses

| **Body** | `{ name, amount, frequency, priority_tier, due_date? }` |
| **Response 201** | Created expense |

### POST /expenses/bulk

| **Body** | `{ items: [...] }` — max 50 items |
| **Item fields** | name, amount, priority_tier, frequency?, due_date? |
| **Used by** | Onboarding wizard |

### PUT /expenses/:expenseId

Full update of expense fields.

### DELETE /expenses/:expenseId

Soft delete (`is_active = false`). Response 204.

**Expense object shape:**

```json
{
  "expense_id": 1,
  "user_id": 1,
  "name": "Rent",
  "amount": 15000,
  "frequency": "monthly",
  "priority_tier": 1,
  "due_date": "2026-06-01",
  "is_active": true
}
```

---

## Incomes

### GET /incomes

List all incomes for user.

### POST /incomes

| **Body** | `{ source_name, amount, expected_date, is_recurring? }` |

### PUT /incomes/:incomeId

### DELETE /incomes/:incomeId

---

## Goals

### GET /goals

### POST /goals

| **Body** | `{ name, target, current? }` |

### PUT /goals/:goalId

### DELETE /goals/:goalId

**Response shape:** `{ id, name, target, current, active }`

---

## Subscriptions

### GET /subscriptions

### POST /subscriptions

| **Body** | `{ name, amount, due_day }` — due_day 1–28 |

### PUT /subscriptions/:subscriptionId

### DELETE /subscriptions/:subscriptionId

**Response shape:** `{ id, name, amount, due_day, active }`

---

## Investments

### GET /investments

### POST /investments

| **Body** | `{ name, type, value, change? }` |
| **type enum** | Mutual Funds, Stocks, Crypto, FDs, Gold, Real Estate, Other |

### PUT /investments/:investmentId

### DELETE /investments/:investmentId

---

## Dashboard & algorithms

### GET /dashboard

Aggregated view: user, allocation, horizon, crisis, expenses_by_tier.

### GET /allocation

Waterfall allocation only. Active subscriptions are included in tier 4 (Lifestyle).

### GET /horizon

365-day balance simulation. Recurring incomes expand monthly; active subscriptions add to daily burn.

### GET /recommendations

Tier-4 cut suggestions when crisis ≠ NORMAL (max 3).

---

## Presets

### GET /presets/:archetype

| **Archetypes** | student, freelancer, family, businessman, worker |
| **Response** | Array of `{ name, default_amount, frequency, priority_tier }` |

---

## Global error format

```json
{ "error": "Human-readable message" }
```

| Code | Typical cause |
|------|---------------|
| 400 | Validation failure, bad Sequelize data |
| 401 | Missing/invalid session |
| 403 | CSRF mismatch |
| 404 | Resource not found or invalid archetype |
| 409 | Duplicate email |
| 429 | Rate limit exceeded |
| 500 | Server error (generic message in production) |

---

## Rate limits

| Scope | Limit |
|-------|-------|
| `/auth/login`, `/auth/register` | 10 requests / 15 minutes |
| All `/api/*` | 120 requests / minute |

Skipped when `NODE_ENV=test`.
