# FlexiBudget Frontend

React SPA for the FlexiBudget adaptive financial planning application.

## Stack

React 18 · Vite 5 · MUI v5 · React Router v6 · Axios · Recharts

## Setup

```bash
npm install
cp .env.example .env   # optional — defaults to http://localhost:5000/api
```

## Run

```bash
npm run dev    # development server at http://localhost:5173
npm start      # alias for dev
npm run build  # production build → dist/
npm run preview
```

Requires the backend API running with `CLIENT_ORIGIN=http://localhost:5173`.

## Environment

| Variable | Default |
|----------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` |

## Source layout

```
src/
├── config/       navigation, lazy route imports, storage keys
├── context/      auth, finance, notifications, theme
├── hooks/        shared React hooks (e.g. useFinanceView)
├── pages/        route-level screens
├── components/   reusable UI (layout, charts, futureLab, forms)
├── services/     Axios API modules
├── theme/        MUI theme and design tokens
└── utils/        client algorithms, formatting, sandbox engine
```

## Key routes

Dashboard `/dashboard` · Expenses `/expenses` · Income `/income` · Future Lab `/future-lab` (sandbox scenarios)

Full route table: [docs/FRONTEND.md](../docs/FRONTEND.md)
