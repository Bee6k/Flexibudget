/** Centralized browser storage keys — keep in sync with backend cookie names where paired. */

export const STORAGE_KEYS = {
  SANDBOX_DRAFT: 'flexibudget_sandbox_draft',
  CSRF: 'flexibudget_csrf',
  THEME: 'flexibudget_theme',
  AUTH_USER: 'authUser',
  GOALS: 'flexibudget_goals',
  SUBSCRIPTIONS: 'flexibudget_subscriptions',
  INVESTMENTS: 'flexibudget_investments',
  DISMISSED_NOTIFICATIONS: 'flexibudget_dismissed_notifications',
};

/** @deprecated import STORAGE_KEYS instead */
export const SANDBOX_STORAGE_KEY = STORAGE_KEYS.SANDBOX_DRAFT;
