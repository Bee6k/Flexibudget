# FlexiBudget Backend

Express + Sequelize + MySQL API for FlexiBudget.

## Stack

- Node.js + Express 4
- Sequelize 6 + MySQL 8
- JWT in HttpOnly cookie + CSRF double-submit
- Jest + Supertest

## Quick start

```bash
cd backend
cp .env.example .env   # set DB_*, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run migrate        # apply SQL migrations
npm run dev            # nodemon on :5000
```

Health check: `GET http://localhost:5000/api/health`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Nodemon API |
| `npm start` | Production `node server.js` |
| `npm run migrate` | Run pending files in `migrations/` |
| `npm test` | Jest (requires a `*test*` database name) |

## Schema ownership

**Migrations only.** `server.js` does **not** call `sequelize.sync()`.

- Add schema changes as new files under `migrations/`
- Cleanup migration `202507110001-cleanup-schema-duplicates.js` repairs duplicate email indexes / FKs from older sync usage
- Inspect live schema: `node scripts/inspect-schema.js`

## Folder map

```
controllers/   # HTTP handlers
services/      # Allocation, horizon, crisis, recommendations
models/        # Sequelize models + associations
routes/        # Express routers + validators
middleware/    # Auth, CSRF, rate limit, validate
migrations/    # Ordered schema changes
utils/         # Finance math, cookies, money limits
tests/         # Jest suites
```

## Core engines

| Service | Role |
|---------|------|
| `allocationService` | Waterfall funding tiers 1→4; subscriptions count as Lifestyle (tier 4) |
| `horizonService` | Daily runway; expands **recurring incomes** monthly; includes subscription burn |
| `crisisService` | NORMAL / CAUTION / CRISIS from days remaining |
| `recommendationService` | Suggest cutting tier-4 expenses when not NORMAL |

## Auth & security (short)

- Cookie: `flexibudget_token` (JWT includes `tv` = `token_version`)
- Logout bumps `token_version` (revokes old tokens)
- Mutating requests need `X-CSRF-Token` matching `flexibudget_csrf`
- Details: [`../docs/AUTHENTICATION.md`](../docs/AUTHENTICATION.md), [`../docs/SECURITY.md`](../docs/SECURITY.md)

## Related docs

- API reference: [`../docs/API.md`](../docs/API.md) · overview [`../docs/API_README.md`](../docs/API_README.md)
- Database: [`../docs/DATABASE.md`](../docs/DATABASE.md)
- Frontend: [`../frontend/README.md`](../frontend/README.md)
