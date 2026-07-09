import { STORAGE_KEYS } from '../config/storageKeys';

export { STORAGE_KEYS };

export const SUBSCRIPTIONS_KEY = STORAGE_KEYS.SUBSCRIPTIONS;
export const INVESTMENTS_KEY = STORAGE_KEYS.INVESTMENTS;
export const DISMISSED_NOTIFICATIONS_KEY = STORAGE_KEYS.DISMISSED_NOTIFICATIONS;

export function getDismissedNotificationIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

export function dismissNotification(id) {
  const set = getDismissedNotificationIds();
  set.add(id);
  localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify([...set]));
}

export function clearDismissedNotifications() {
  localStorage.removeItem(DISMISSED_NOTIFICATIONS_KEY);
}
