# FlexiBudget Documentation Index

Welcome to the FlexiBudget technical documentation. Read these in order if you are new to the project.

| Document | Audience | Contents |
|----------|----------|----------|
| [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) | New developers | Day-one setup, repo tour, first tasks |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architects, leads | System design, flows, module map |
| [DATABASE.md](./DATABASE.md) | Backend devs, DBAs | Models, relationships, constraints |
| [API.md](./API.md) | Frontend & backend devs | Every REST endpoint |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Security reviewers | Login, cookies, CSRF, authorization |
| [SECURITY.md](./SECURITY.md) | Auditors, maintainers | Threat model, critical sections |
| [FRONTEND.md](./FRONTEND.md) | UI developers | Pages, components, state |
| [MAINTAINER.md](./MAINTAINER.md) | Long-term owners | Safe changes, regression areas |

## Quick reference

```
Browser (React SPA, port 5173)
        │  cookies + CSRF
        ▼
Express API (port 5000)
        │  Sequelize ORM
        ▼
MySQL 8 (flexibudget)
```

## Business purpose

FlexiBudget helps people with **irregular income** plan spending in **NPR** using a **4-tier waterfall** model (Essentials → Stability → Goals → Lifestyle). Three algorithms drive insights:

1. **Waterfall Allocation** — fund tiers in priority order from current balance
2. **Risk Horizon** — project daily balance for up to 365 days
3. **Crisis State** — classify runway as NORMAL, CAUTION, or CRISIS
