# FlexiBudget Authentication & Authorization

## Overview

FlexiBudget uses **stateless JWT sessions** delivered via **HttpOnly cookies**. There are no server-side session stores; the JWT payload `{ sub: userId }` is verified on each protected request.

Authorization is **binary**: authenticated users access only their own data via `user_id` scoping. There is no admin role.

---

## Login flow

```
┌──────────┐    POST /auth/login     ┌──────────┐
│ LoginPage│ ──────────────────────► │ Backend  │
│          │   { email, password }   │          │
└──────────┘                         └────┬─────┘
     ▲                                    │
     │                                    ├─ bcrypt.compare(password, hash)
     │                                    ├─ jwt.sign({ sub: user.id })
     │                                    ├─ Set HttpOnly cookie flexibudget_token
     │                                    └─ Set CSRF cookie + return { user }
     │         { user }                   │
     └────────────────────────────────────┘
AuthContext: setUser, setSessionActive(true)
Navigate → /dashboard
```

**Files involved:**
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/auth.js`
- `backend/controllers/authController.js` → `login()`
- `backend/utils/authCookie.js` → `setAuthCookie()`

---

## Registration flow

```
RegisterPage → POST /auth/register → User.create (bcrypt hash)
              → 201 { user } (no auto-login cookie)
              → RegisterPage calls AuthContext.login()
```

**Security:** Password hashed with bcrypt (10 rounds). Email normalized to lowercase. Duplicate emails rejected with 409.

---

## Session bootstrap (app load)

```
App mount → AuthProvider useEffect
         → GET /auth/csrf (sets CSRF cookie)
         → GET /auth/verify (cookie sent automatically)
              ├─ 200: setUser, sessionActive=true
              └─ 401: clear user, sessionActive=false
PrivateRoute: if !user && !checking → redirect /login
```

**Files:**
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/PrivateRoute.jsx`
- `frontend/src/services/api.js` (withCredentials: true)

---

## Token validation (every protected request)

```
SECURITY CRITICAL — middleware/auth.js

1. readAuthToken(req) — cookie first, then Authorization Bearer
2. jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
3. User.findByPk(payload.sub)
4. req.user = user | 401
```

**Why cookie + Bearer:** Cookies protect the SPA; Bearer supports Jest/Supertest without cookie jar complexity.

---

## CSRF flow

```
Mutating request (POST/PUT/DELETE):
1. Frontend ensureCsrfToken() → GET /auth/csrf (if not cached)
2. Request header X-CSRF-Token = cookie flexibudget_csrf
3. middleware/csrf.js compares header === cookie
4. Mismatch → 403
```

**Skipped in test environment** (`NODE_ENV=test`).

**Why:** HttpOnly auth cookie cannot be read by JS, but cookies are sent automatically on cross-origin requests. CSRF token ensures mutating requests originate from our frontend.

---

## Logout flow

```
TopBar/Profile → AuthContext.logout()
              → POST /auth/logout (clears cookie)
              → clearAuthSession() (local user cache)
              → resetCsrfToken()
              → navigate /login
```

---

## 401 handling

```
Any API 401 (except login/register) while sessionActive:
→ clearAuthSession()
→ resetCsrfToken()
→ forceLogout + redirect /login with "session expired" message
```

Configured in `api.js` response interceptor + `AuthContext` unauthorized handler.

---

## JWT configuration

| Setting | Source | Default |
|---------|--------|---------|
| Secret | `JWT_SECRET` env | min 32 chars, blocklist for weak values |
| Algorithm | HS256 only | |
| Expiry | `JWT_EXPIRES_IN` | 1h |

See `backend/config/jwt.js` and `backend/utils/validateEnv.js`.

---

## Authorization (data access)

There is **no RBAC**. All authorization is **ownership-based**:

```javascript
// Pattern used in every controller
where: { id: resourceId, user_id: req.user.id }
```

**Risk:** Omitting `user_id` in a query enables IDOR. Always copy the existing `findOwned*` pattern.

---

## Password rules

- Register: 8–128 characters
- Stored: bcrypt hash only
- Never returned in API responses (`serializeUser` strips sensitive fields)

---

## Environment requirements

| Variable | Purpose |
|----------|---------|
| JWT_SECRET | Signing key — **required**, 32+ chars |
| CLIENT_ORIGIN | CORS origin — required in production |
| NODE_ENV | production enables secure cookies |

---

## Files reference

| File | Role |
|------|------|
| `backend/middleware/auth.js` | JWT verification |
| `backend/middleware/csrf.js` | CSRF double-submit |
| `backend/utils/authCookie.js` | Cookie set/clear/read |
| `backend/controllers/authController.js` | Login/register/logout/csrf |
| `backend/config/jwt.js` | JWT options + secret validation |
| `frontend/src/services/api.js` | CSRF + 401 interceptor |
| `frontend/src/context/AuthContext.jsx` | Session state |
| `frontend/src/utils/authSession.js` | Local user cache (not token) |
