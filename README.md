# FlexiBudget

**Plan your money when income isn’t steady.**

FlexiBudget is a full-stack web app for people with irregular income — freelancers, students, gig workers, small business owners — who need to know what they can safely spend *today*, and what might happen *next month*.

It was built as a final-year capstone project.

---

## What problem does it solve?

Most budgeting apps assume a fixed paycheck. Real life often doesn’t work that way.

FlexiBudget helps you:

1. **See what’s covered** — essentials first, then stability, then lifestyle  
2. **Look ahead** — a simple forecast of your balance over the coming weeks  
3. **Stay out of trouble** — clear signals when money is getting tight  
4. **Try “what if?”** — Future Lab lets you experiment without changing real data  

---

## Main features

| Feature | What it does |
|--------|----------------|
| **Dashboard** | Balance, burn rate, coverage by priority, and outlook charts |
| **Income & expenses** | Track sources and bills; one-time items update your balance |
| **Onboarding** | Quick setup with role-based expense presets |
| **Future Lab** | Sandbox scenarios, money journey, and clickable future dates |
| **Goals, subscriptions, investments** | Extra planning tools stored on the server |
| **Dark & light mode** | Theme that works on desktop and mobile |

---

## How the “brain” works (simple version)

Three ideas power the live numbers:

1. **Waterfall allocation** — Money fills Survival → Stability → Strategic → Lifestyle, in that order  
2. **Risk horizon** — Day-by-day projection of balance, income, and bills  
3. **Crisis state** — Labels your situation as normal, caution, or crisis based on coverage and runway  

The backend is the source of truth. Future Lab can simulate changes on the client before you apply them.

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React 18, Vite, MUI, Recharts |
| Backend | Node.js, Express, Sequelize |
| Database | MySQL 8 |
| Auth | HttpOnly JWT cookies + CSRF |
| Tests | Jest + Supertest (backend) |

---

## Quick start (local)

### What you need

- Node.js 18+ (20 LTS recommended)  
- MySQL 8  
- npm  

> **Windows tip:** If PowerShell blocks scripts, use `npm.cmd` instead of `npm`.

### 1. Create the database

```sql
CREATE DATABASE flexibudget;
CREATE USER 'flexiuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON flexibudget.* TO 'flexiuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Start the API

```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
```

Edit `.env`:

- MySQL host, user, password, database name  
- `JWT_SECRET` — at least 32 random characters  
- `CLIENT_ORIGIN=http://localhost:5173`

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then:

```bash
npm install
npm run dev
```

API: [http://localhost:5000](http://localhost:5000)  
Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Start the app

```bash
cd frontend
cp .env.example .env          # optional; defaults work for local API
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

---

## Docker (optional)

From the project root (with a strong `JWT_SECRET` set):

```bash
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
docker compose up --build
```

- App: [http://localhost:8080](http://localhost:8080)  
- API (direct): [http://localhost:5000](http://localhost:5000)  

The web container proxies `/api` to the API so login cookies work on the same origin.

---

## Project layout

```
bishal_ug/
├── backend/          # Express API, models, migrations, tests
├── frontend/         # React app (Vite)
├── docs/             # Deeper technical guides
├── scripts/          # e.g. MySQL backup helper
├── docker-compose.yml
└── README.md         # You are here
```

---

## Tests

```bash
cd backend
npm test
```

---

## Security (short version)

- Passwords are hashed (bcrypt)  
- Session JWT lives in an **HttpOnly** cookie (not readable by page scripts)  
- Mutating requests need a CSRF token  
- Rate limits on login/register and the API  
- Logout invalidates outstanding tokens via `token_version`  

Never commit real `.env` files or weak secrets.

---

## More documentation

| Doc | For |
|-----|-----|
| [Developer onboarding](./docs/DEVELOPER_ONBOARDING.md) | First-day setup |
| [Architecture](./docs/ARCHITECTURE.md) | How pieces connect |
| [API reference](./docs/API.md) | Endpoints |
| [Database](./docs/DATABASE.md) | Schema |
| [Authentication](./docs/AUTHENTICATION.md) | Cookies & CSRF |
| [Security](./docs/SECURITY.md) | Threat notes |
| [Frontend](./docs/FRONTEND.md) | UI structure |
| [Maintainer notes](./docs/MAINTAINER.md) | What is safe to change |

---

## Status

Ready for **demo and local use**. Production deploys should use HTTPS, a strong `JWT_SECRET`, same-origin (or carefully configured) cookies, and regular database backups (`scripts/backup-mysql.sh`).

---

## License / academic use

Capstone / educational project. Use and adapt with attribution as required by your course or institution.
