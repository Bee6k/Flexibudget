import {
  SUBSCRIPTIONS_KEY,
  INVESTMENTS_KEY,
  DISMISSED_NOTIFICATIONS_KEY,
} from './localData';
import { STORAGE_KEYS } from '../config/storageKeys';

export const AUTH_USER_KEY = STORAGE_KEYS.AUTH_USER;
export const GOALS_KEY = STORAGE_KEYS.GOALS;

export function clearUserLocalData() {
  localStorage.removeItem(SUBSCRIPTIONS_KEY);
  localStorage.removeItem(INVESTMENTS_KEY);
  localStorage.removeItem(DISMISSED_NOTIFICATIONS_KEY);
  localStorage.removeItem(GOALS_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_USER_KEY);
  clearUserLocalData();
}

export function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function persistUser(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
