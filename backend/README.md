# FlexiBudget API

Express REST API with Sequelize ORM and MySQL.

## Setup

```bash
npm install
cp .env.example .env
# Edit DB credentials and JWT_SECRET (min 32 characters)
```

## Run

```bash
npm run dev     # development with nodemon — http://localhost:5000
npm start       # production mode
npm run migrate # run pending migrations manually
npm test        # Jest + Supertest (requires MySQL)
```

## Environment

See `.env.example` for all variables. Required: `DB_*`, `JWT_SECRET`, `CLIENT_ORIGIN` (production).

Health check: `GET /api/health`

Full API reference: [docs/API.md](../docs/API.md)
