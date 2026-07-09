/**
 * FILE: context/AuthContext.jsx
 *
 * PURPOSE:
 * Global authentication state for the React SPA (cookie-based sessions).
 *
 * RESPONSIBILITIES:
 * - Bootstrap session via GET /auth/verify on app load
 * - login(), logout(), register() wrappers
 * - Register 401 handler → force logout + redirect to /login
 *
 * USED BY:
 * - App.jsx (wraps all routes)
 * - PrivateRoute, LoginPage, AppShell, ProfilePage, OnboardingWizard
 *
 * DEPENDENCIES:
 * - services/auth.js, services/api.js, utils/authSession.js
 *
 * SECURITY NOTES:
 * - JWT stored in HttpOnly cookie — not in React state or localStorage
 * - authUser in localStorage is display cache only (not authoritative)
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/auth';
import { setUnauthorizedHandler, setSessionActive, ensureCsrfToken } from '../services/api';
import { clearAuthSession, readStoredUser, persistUser } from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readStoredUser());
  const [checking, setChecking] = useState(true);

  const forceLogout = useCallback(() => {
    clearAuthSession();
    setSessionActive(false);
    setUser(null);
    setChecking(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      forceLogout();
      navigate('/login', { replace: true, state: { message: 'Your session expired. Please sign in again.' } });
    });
    return () => setUnauthorizedHandler(null);
  }, [forceLogout, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await ensureCsrfToken();
        const data = await authApi.verify();
        if (cancelled) return;
        if (data?.user) {
          setUser(data.user);
          persistUser(data.user);
          setSessionActive(true);
        }
      } catch {
        if (!cancelled) {
          persistUser(null);
          setUser(null);
          setSessionActive(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [forceLogout]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    persistUser(data.user);
    setSessionActive(true);
    return data.user;
  }, []);

  const register = useCallback((payload) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* still clear local session */
    }
    forceLogout();
    navigate('/login', { replace: true });
  }, [forceLogout, navigate]);

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
