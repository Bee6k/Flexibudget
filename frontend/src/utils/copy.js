/** Customer-facing labels — avoid internal/project terminology in the UI. */

export const PRIORITY_LABELS = {
  1: 'Essentials',
  2: 'Stability',
  3: 'Goals',
  4: 'Lifestyle',
};

export const STATUS_LABELS = {
  NORMAL: 'Stable',
  CAUTION: 'Needs attention',
  CRISIS: 'Urgent',
};

export function priorityLabel(tier) {
  return PRIORITY_LABELS[tier] || 'Other';
}

export function statusLabel(state) {
  return STATUS_LABELS[state] || state;
}

export function daysRemainingLabel(days) {
  if (days === null || days === undefined) return 'More than a year';
  if (days === 0) return 'Today';
  return `${days} day${days === 1 ? '' : 's'}`;
}
