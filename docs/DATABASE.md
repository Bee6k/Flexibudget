# FlexiBudget Database Documentation

ORM: **Sequelize 6** · Database: **MySQL 8** · Migrations: `backend/migrations/`

---

## Entity relationship diagram

```
users (1) ──────< (N) expenses
  │
  ├────────────< (N) incomes
  ├────────────< (N) goals
  ├────────────< (N) subscriptions
  └────────────< (N) investments

expense_categories (standalone preset lookup, no FK to users)
schema_migrations (migration tracking)
```

All user-owned tables use `ON DELETE CASCADE` from `users`.

---

## users

**Purpose:** Registered application users and their financial profile.

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | Auto-increment |
| name | VARCHAR(120) | Required |
| email | VARCHAR(255) | **Unique**, indexed — login lookup |
| password_hash | VARCHAR(255) | bcrypt hash; never exposed in API |
| current_balance | DECIMAL(12,2) | Default 0; used by allocation/horizon |
| archetype | VARCHAR(32) | student, freelancer, family, businessman, worker |
| onboarding_completed | BOOLEAN | Default false |

**Relationships:** One user → many expenses, incomes, goals, subscriptions, investments.

**Constraints:** Email unique. Password stored hashed only.

**Performance:** Unique index on `email`.

---

## expenses

**Purpose:** User spending items assigned to priority tiers for waterfall allocation.

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | |
| user_id | INT UNSIGNED FK | Required |
| name | VARCHAR(100) | |
| amount | DECIMAL(10,2) | Min 0.01 |
| frequency | ENUM | weekly, monthly, yearly, **one-time** |
| priority_tier | INT | 1–4 (Essentials → Lifestyle) |
| due_date | DATEONLY | Optional; used for payment reminders |
| is_active | BOOLEAN | Soft delete when false |

**Indexes:** `user_id`; composite `(user_id, priority_tier)`.

**Business rules:**
- Tier 1 funded before tier 2, etc.
- `one-time` frequency → monthly burn contribution is **0**
- Soft delete preserves history (`is_active = false`)

---

## incomes

**Purpose:** Expected income events for horizon simulation.

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | |
| user_id | INT UNSIGNED FK | |
| source_name | VARCHAR(100) | |
| amount | DECIMAL(10,2) | |
| expected_date | DATEONLY | Required |
| is_recurring | BOOLEAN | Default false |

**Indexes:** `user_id`; composite `(user_id, expected_date)`.

**Used by:** `horizonService` — adds income to running balance on matching dates.

---

## expense_categories

**Purpose:** Archetype-based preset templates for onboarding (not user-owned rows).

| Column | Type | Notes |
|--------|------|-------|
| name | VARCHAR | |
| default_amount | DECIMAL | Suggested amount |
| frequency | ENUM | |
| priority_tier | INT | 1–4 |
| archetype | ENUM | student, freelancer, family, businessman, worker, general |

**Seeded on startup** via `seedPresetCategories()` — idempotent `findOrCreate` by name+archetype.

**Migration:** `202506030001` expands ENUM to include businessman/worker.

---

## goals

**Purpose:** Savings targets (e.g. Emergency Fund, House).

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | |
| user_id | INT UNSIGNED FK | |
| name | VARCHAR(100) | |
| target_amount | DECIMAL(12,2) | |
| current_amount | DECIMAL(12,2) | Default 0 |
| is_active | BOOLEAN | Soft delete |

**API maps to:** `{ id, name, target, current, active }`.

---

## subscriptions

**Purpose:** Recurring charges with billing day for notification reminders.

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | |
| user_id | INT UNSIGNED FK | |
| name | VARCHAR(100) | |
| amount | DECIMAL(10,2) | Monthly cost |
| due_day | INT | 1–28 (billing day of month) |
| is_active | BOOLEAN | |

**Business rule:** Notification system reminds 7 and 1 days before next billing date.

---

## investments

**Purpose:** User-tracked holdings (manual entry, not live market data).

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED PK | |
| user_id | INT UNSIGNED FK | |
| name | VARCHAR(100) | |
| asset_type | VARCHAR(50) | Mutual Funds, Stocks, etc. |
| value | DECIMAL(14,2) | |
| change_pct | DECIMAL(6,2) | Display % change |
| is_active | BOOLEAN | Soft delete |

---

## schema_migrations

**Purpose:** Tracks applied SQL/JS migrations.

| Column | Type |
|--------|------|
| name | VARCHAR(255) PK |
| applied_at | DATETIME |

---

## Migration files

| File | Purpose |
|------|---------|
| `202506030001-fix-expense-category-archetype-enum.js` | Adds businessman/worker to ENUM |
| `202506030002-create-user-data-tables.js` | Creates goals, subscriptions, investments |

**Startup order:** `sequelize.sync()` → `runMigrations()` → `seedPresetCategories()`.

---

## IDOR prevention pattern

All user data queries include `user_id: req.user.id`:

```javascript
Expense.findOne({ where: { id: expenseId, user_id: userId, is_active: true } })
```

Never trust client-supplied user IDs.
