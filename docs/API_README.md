# FlexiBudget API — Developer Guide

Friendly overview of the HTTP API. Full endpoint tables live in [`API.md`](./API.md).

## Base URL

```
http://localhost:5000/api
```

In local Vite, the browser usually calls `/api` (proxied). Production needs `VITE_API_URL` pointing at the real API origin.

## Auth model (read this first)

1. `GET /auth/csrf` → sets `flexibudget_csrf` cookie, returns `{ csrfToken }`
2. `POST /auth/register` or `POST /auth/login` → sets HttpOnly `flexibudget_token`
3. Every mutating request (`POST` / `PUT` / `DELETE`) must send header:
   ```
   X-CSRF-Token: <same value as csrf cookie>
   ```
4. `POST /auth/logout` clears the session and increments `token_version`

Axios in the frontend does this automatically via `services/api.js`.

## Endpoint groups

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/health` | No | Liveness + DB ping |
| `/auth/*` | Mixed | CSRF, register, login, logout, verify |
| `/users/*` | Yes | Profile, balance, onboarding |
| `/expenses/*` | Yes | CRUD (+ bulk create) |
| `/incomes/*` | Yes | CRUD (hard delete) |
| `/goals/*` | Yes | Soft-delete goals |
| `/subscriptions/*` | Yes | Soft-delete subscriptions |
| `/investments/*` | Yes | Soft-delete investments |
| `/presets/:archetype` | Yes | Onboarding expense templates |
| `/dashboard` | Yes | Aggregated allocation + horizon + crisis |
| `/allocation` | Yes | Waterfall only |
| `/horizon` | Yes | Runway simulation only |
| `/recommendations` | Yes | Tier-4 cut suggestions when runway is tight |

## Money rules

- Amounts are decimals; validators cap values to MySQL column sizes (`utils/moneyLimits.js`).
- **Expenses / incomes / subscriptions:** up to `99,999,999.99`
- **Balance / goals:** up to `9,999,999,999.99`
- Frequencies: `weekly` | `monthly` | `yearly` | `one-time` (expenses)
- One-time items dated today or earlier adjust `users.current_balance` immediately (transactional)

## Horizon & allocation semantics

- **Recurring incomes** (`is_recurring: true`) project monthly on the same day-of-month for ~12 months.
- **Active subscriptions** add to monthly burn and to Lifestyle (tier 4) in allocation.
- Daily burn ≈ (monthly expenses + monthly subscriptions) / 30.
- Crisis bands: >30 days NORMAL · 7–30 CAUTION · <7 CRISIS.

## Soft vs hard delete

| Resource | Delete behavior |
|----------|-----------------|
| Expenses, goals, subscriptions, investments | Soft (`is_active = false`) |
| Incomes | Hard delete (row removed; reverses one-time balance if needed) |

## Example: create expense

```http
POST /api/expenses
Cookie: flexibudget_token=…; flexibudget_csrf=…
X-CSRF-Token: …
Content-Type: application/json

{
  "name": "Rent",
  "amount": 25000,
  "frequency": "monthly",
  "priority_tier": 1,
  "due_date": "2026-07-01"
}
```

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Validation / invalid data |
| 401 | Missing or invalid session |
| 403 | CSRF failure |
| 404 | Not found (or not owned) |
| 409 | Duplicate email on register |
| 429 | Rate limited (auth) |

## More detail

- Exhaustive reference: [`API.md`](./API.md)
- Auth deep dive: [`AUTHENTICATION.md`](./AUTHENTICATION.md)
- Schema: [`DATABASE.md`](./DATABASE.md)
