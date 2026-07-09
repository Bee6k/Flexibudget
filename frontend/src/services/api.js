/**
 * FILE: services/api.js
 *
 * PURPOSE:
 * SECURITY CRITICAL — Shared Axios client with CSRF and session handling.
 */
import axios from 'axios';
import { clearAuthSession } from '../utils/authSession';
import { STORAGE_KEYS } from '../config/storageKeys';

const CSRF_COOKIE = STORAGE_KEYS.CSRF;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true,
});

let unauthorizedHandler = null;
let sessionActive = false;
let csrfToken = null;

function readCsrfCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function setSessionActive(active) {
  sessionActive = active;
}

export function setCsrfToken(token) {
  csrfToken = token || null;
}

export function resetCsrfToken() {
  csrfToken = null;
}

/**
 * Returns a CSRF token aligned with the flexibudget_csrf cookie.
 * Cookie is preferred over memory because login rotates the cookie without updating cache.
 */
export async function ensureCsrfToken(forceRefresh = false) {
  if (!forceRefresh) {
    const fromCookie = readCsrfCookie();
    if (fromCookie) {
      csrfToken = fromCookie;
      return csrfToken;
    }
    if (csrfToken) return csrfToken;
  }

  const res = await api.get('/auth/csrf');
  csrfToken = res.data.csrfToken;
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (method && !['get', 'head', 'options'].includes(method)) {
    const token = await ensureCsrfToken();
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    const status = err.response?.status;
    const path = config?.url || '';
    const isAuthAttempt = /\/auth\/(login|register)$/.test(path);
    const csrfError = status === 403
      && typeof err.response?.data?.error === 'string'
      && err.response.data.error.toLowerCase().includes('csrf');

    if (csrfError && config && !config._csrfRetry) {
      config._csrfRetry = true;
      resetCsrfToken();
      const token = await ensureCsrfToken(true);
      config.headers['X-CSRF-Token'] = token;
      return api(config);
    }

    if (status === 401 && sessionActive && !isAuthAttempt) {
      clearAuthSession();
      resetCsrfToken();
      setSessionActive(false);
      unauthorizedHandler?.();
    }
    return Promise.reject(err);
  }
);

export default api;
