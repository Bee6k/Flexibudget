# FlexiBudget Security Documentation

## Security score context

The app implements baseline protections suitable for **local demo / capstone**. Review before production deployment with real financial data.

---

## Threat model summary

| Threat | Mitigation | Residual risk |
|--------|------------|---------------|
| XSS stealing session | HttpOnly JWT cookie | XSS can still perform actions while user is logged in |
| CSRF | Double-submit CSRF token | Disabled in test env only |
| Brute-force login | Rate limit 10/15min on auth | No account lockout |
| IDOR | user_id scoping on all queries | Must maintain in new endpoints |
| SQL injection | Sequelize parameterized queries | Raw queries must be reviewed |
| Weak JWT secret | Startup validation + blocklist | Operator must set strong secret |
| Credential stuffing | Generic "invalid email or password" | No MFA |

---

## SECURITY CRITICAL SECTIONS

Mark these before any modification:

### 1. Authentication middleware
**File:** `backend/middleware/auth.js`

Determines whether requests reach protected handlers. Incorrect changes could bypass authentication entirely.

### 2. CSRF protection
**File:** `backend/middleware/csrf.js`

Prevents cross-site mutating requests. Do not disable in production.

### 3. JWT secret handling
**Files:** `backend/config/jwt.js`, `backend/utils/validateEnv.js`

Weak secrets allow token forgery.

### 4. Password hashing
**File:** `backend/controllers/authController.js`

Must remain bcrypt; never store or log plaintext passwords.

### 5. User data scoping
**Files:** All `*Controller.js` with `findOwned*` helpers

Missing `user_id` filter = horizontal privilege escalation.

### 6. Cookie flags
**File:** `backend/utils/authCookie.js`

- `httpOnly: true` — prevents JS token theft
- `sameSite: 'strict'` — reduces CSRF
- `secure: true` in production — HTTPS only

### 7. Frontend session interceptor
**File:** `frontend/src/services/api.js`

401 handler clears session; incorrect logic could leave stale UI state.

---

## Headers & middleware stack

```
helmet()           — security HTTP headers
cors({ credentials }) — origin whitelist
cookieParser()     — parse auth + CSRF cookies
express.json({ limit: '100kb' }) — body size cap
rateLimit          — auth + API throttling
csrfProtection     — mutating request validation
```

---

## Sensitive data handling

| Data | Exposure |
|------|----------|
| password_hash | Database only |
| JWT | HttpOnly cookie only |
| User profile | API via serializeUser (no hash) |
| 5xx errors | Generic "Internal server error" |
| Sequelize errors | Generic "Invalid data submitted" |

---

## Input validation

All write endpoints use `express-validator` + `middleware/validate.js`.

Examples:
- Email format on auth
- Amount min 0.01 on financial records
- Archetype whitelist on onboarding
- Bulk expense max 50 items

---

## Rate limiting

| Route | Limit |
|-------|-------|
| POST /auth/login, /auth/register | 10 / 15 min |
| /api/* | 120 / min |

See `backend/middleware/rateLimit.js`.

---

## What is NOT protected yet

- No Content-Security-Policy on frontend
- No MFA / email verification
- No audit logging of financial changes
- Dismissed notifications in localStorage (non-sensitive)
- No per-user API quotas beyond global rate limit
- Horizon ignores one-time expense due-date spikes

---

## Security testing checklist

- [ ] Login with wrong password → 401, no cookie
- [ ] Access /dashboard without cookie → redirect login
- [ ] POST /expenses without CSRF → 403
- [ ] Access another user's expense ID → 404
- [ ] JWT with tampered payload → 401
- [ ] Weak JWT_SECRET at startup → process exit

Run: `cd backend && npm test` (includes auth + IDOR patterns).

---

## Incident response notes

If JWT_SECRET is compromised: rotate secret, restart backend, all users must re-login (old tokens invalid).

If CSRF bypass suspected: verify `csrfProtection` order in `server.js` before routes.
