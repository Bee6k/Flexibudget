# FlexiBudget

Adaptive financial planning for irregular income earners. Final year capstone project.

Three algorithmic components: **Waterfall Allocation Engine**, **Risk Horizon Simulator**, and **Crisis State Evaluator**.

## Documentation

Full technical documentation lives in [`docs/`](./docs/README.md):

| Guide | Description |
|-------|-------------|
| [Developer Onboarding](./docs/DEVELOPER_ONBOARDING.md) | Day-one setup and learning path |
| [Architecture](./docs/ARCHITECTURE.md) | System design and data flow |
| [API Reference](./docs/API.md) | All REST endpoints |
| [Database](./docs/DATABASE.md) | Models, relationships, migrations |
| [Authentication](./docs/AUTHENTICATION.md) | Cookies, CSRF, session flow |
| [Security](./docs/SECURITY.md) | Threat model and critical sections |
| [Frontend](./docs/FRONTEND.md) | Pages, components, state |
| [Maintainer Notes](./docs/MAINTAINER.md) | Safe vs risky change areas |
| [Cleanup Report](./docs/CLEANUP_REPORT.md) | Dead code removal log |

Source files include file-level JSDoc headers on critical modules (server, auth, services, contexts).

## Status

**Feature-complete for capstone demo.** Auth, CRUD, onboarding, dashboard algorithms, notifications, and server-backed goals/subscriptions/investments are implemented.

## Stack

- **Frontend:** React 18, Vite 5, MUI v5, React Router v6, Axios, Recharts
- **Backend:** Node 18+, Express 4, Sequelize 6, MySQL 8
- **Auth:** HttpOnly JWT cookies + CSRF protection (Bearer still supported for tests)
- **Tests:** Jest, Supertest

## Prerequisites

- Node.js 18+ LTS (tested on 20.18)
- MySQL 8.0+ running locally (e.g. XAMPP)
- npm 10+

**Important (Windows / zip downloads):** If you opened `Downloads\bishal_ug`, the app lives in the **nested** folder `bishal_ug\bishal_ug\`. Run all commands from there:

```powershell
cd C:\Users\acer\Downloads\bishal_ug\bishal_ug
```

Then `cd backend` or `cd frontend` as below.

**PowerShell on Windows:** If `npm` fails with *"running scripts is disabled"*, use **`npm.cmd`** instead of `npm` (same commands, e.g. `npm.cmd install`, `npm.cmd run dev`). This avoids changing execution policy.

## Setup

### 1. Database

```sql
CREATE DATABASE flexibudget;
CREATE USER 'flexiuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON flexibudget.* TO 'flexiuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
```

Edit `.env`:

- Set MySQL credentials
- Set `JWT_SECRET` to a random string of **at least 32 characters**
  ```powershell
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

```powershell
npm.cmd install
npm.cmd run dev        # http://localhost:5000 (nodemon)
# or: npm.cmd start    # production mode without reload
```

Health check: `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

Migrations run automatically on startup. To run them manually:

```powershell
npm.cmd run migrate
```

### 3. Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev       # http://localhost:5173
# or: npm.cmd start
```

The frontend sends cookies with every API request (`withCredentials: true`). Keep `CLIENT_ORIGIN=http://localhost:5173` in the backend `.env`.

## Project layout

```
flexibudget/
├── backend/
│   ├── config/         # database, JWT
│   ├── controllers/    # request handlers
│   ├── middleware/     # auth, CSRF, validation, rate limits
│   ├── migrations/     # schema migrations (ENUM fix, user data tables)
│   ├── models/         # User, Expense, Income, Goal, Subscription, Investment
│   ├── routes/         # API route definitions
│   ├── services/       # allocation, horizon, crisis, recommendations
│   ├── tests/          # Jest + Supertest
│   └── server.js
└── frontend/
    └── src/
        ├── config/     # navigation, storage keys, lazy pages
        ├── hooks/      # shared React hooks
        ├── components/ # AppShell, onboarding, charts, Future Lab
        ├── context/    # Auth, Finance, Notifications, Theme
        ├── pages/      # Dashboard, expenses, goals, Future Lab, etc.
        └── services/   # Axios API client (cookie + CSRF)
```

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `GET /auth/csrf`, `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/verify` |
| Expenses | CRUD + bulk create |
| Incomes | CRUD |
| Goals | CRUD (server-backed) |
| Subscriptions | CRUD (server-backed, powers billing reminders) |
| Investments | CRUD (server-backed) |
| Dashboard | Allocation, horizon, crisis, recommendations |

## Security notes

- JWT stored in **HttpOnly** cookie (not accessible to JavaScript)
- CSRF token required on POST/PUT/DELETE requests
- Rate limiting on auth and API routes
- Helmet security headers
- Set a strong `JWT_SECRET` before running in any shared environment

## Tests

```bash
cd backend
npm test
```

## Notes on tech-stack choices

- **Vite over create-react-app.** CRA is deprecated; Vite 5 is used (Vite 8 requires Node 20.19+, while this machine runs Node 20.18).
- **React 18, not 19.** Pinned to match the spec and MUI v5's supported range.
- **Cookie auth over localStorage JWT.** Reduces XSS session theft risk for a finance app.
