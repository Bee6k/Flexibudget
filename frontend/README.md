# FlexiBudget Frontend

React SPA for adaptive budgeting (irregular income). Talks to the Express API over cookies + CSRF.

## Stack

- React 18 + Vite 5
- MUI v5 (theme in `src/theme/`)
- React Router v6
- Axios (`src/services/api.js`)
- Recharts for charts

## Quick start

```bash
cd frontend
cp .env.example .env   # if needed
npm install
npm run dev
```

Open **http://localhost:5173**. For phones on the same Wi‑Fi, use your PC LAN IP (Vite `host: true`) and keep:

```env
VITE_API_URL=/api
```

Vite proxies `/api` → `http://127.0.0.1:5000`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (LAN-friendly) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Folder map

```
src/
  pages/           # Route screens
  components/      # UI + feature widgets
  context/         # Auth, Finance, Theme, Notifications
  services/        # Thin API clients
  utils/           # Money math, dates, Future Lab engine
  config/          # Navigation + icons
  theme/           # Colors / MUI theme
```

## How data flows

1. `AuthContext` verifies session (`GET /auth/verify`) and loads CSRF.
2. `FinanceContext` loads dashboard + incomes and derives `view` (live or sandbox).
3. Pages read `useFinanceView()` — never call allocation/horizon APIs ad hoc unless needed.
4. Mutations go through `services/*` then `refresh()`.

## Important product notes

- **Budget tips** (`/advise`) are rules-based, not AI.
- **Future Lab** is a sandbox; “Save to real budget” writes via the API.
- **Emergency Fund** page estimates coverage from **current balance ÷ burn**, not a separate fund ledger.
- Date fields from the API are `YYYY-MM-DD` — use `utils/dates.js` (`parseDateOnly`) to avoid timezone day-shifts.

## Related docs

- Full UI notes: [`../docs/FRONTEND.md`](../docs/FRONTEND.md)
- API contract: [`../docs/API.md`](../docs/API.md) and [`../docs/API_README.md`](../docs/API_README.md)
- Backend: [`../backend/README.md`](../backend/README.md)
