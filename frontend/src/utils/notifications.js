/**
 * FILE: utils/notifications.js
 *
 * PURPOSE:
 * Builds in-app notification objects from expenses, subscriptions, and crisis data.
 *
 * RESPONSIBILITIES:
 * - Payment reminders at 7 and 1 days before due date
 * - Subscription billing reminders (due_day of month)
 * - System alerts from crisis state (CAUTION/CRISIS)
 *
 * USED BY:
 * - NotificationContext.jsx
 *
 * BUSINESS RULES:
 * - Only monthly expenses with due_date generate payment reminders
 * - Dismissed IDs filtered via localStorage (client-only)
 */
import { formatCurrency } from './currency';
import { nextDueDate, daysUntil, formatDueLabel, startOfDay } from './dueDates';
import { getDismissedNotificationIds } from './localData';
import { statusLabel } from './copy';

const REMINDER_DAYS = [7, 1];

function reminderCopy(days, name, amount, due) {
  const when = formatDueLabel(due);
  const price = amount ? ` (${formatCurrency(amount)})` : '';
  if (days === 7) return `${name}${price} is due in 1 week — ${when}.`;
  if (days === 1) return `${name}${price} is due tomorrow — ${when}.`;
  return `${name}${price} is due soon — ${when}.`;
}

function pushPaymentReminder(list, { idPrefix, name, amount, dueDate, dueDay, frequency, type }) {
  const next = nextDueDate({ dueDate, dueDay, frequency }, startOfDay());
  if (!next) return;

  const days = daysUntil(startOfDay(), next);
  if (!REMINDER_DAYS.includes(days)) return;

  const dueKey = next.toISOString().slice(0, 10);
  list.push({
    id: `${idPrefix}-${dueKey}-${days}d`,
    type,
    severity: days === 1 ? 'warning' : 'info',
    title: days === 7 ? 'Due in 1 week' : 'Due tomorrow',
    message: reminderCopy(days, name, amount, next),
    dueDate: dueKey,
    daysUntil: days,
    amount: Number(amount) || 0,
    sourceName: name,
  });
}

export function buildPaymentNotifications(expenses = []) {
  const items = [];

  for (const expense of expenses) {
    if (expense.is_active === false) continue;
    if (expense.frequency !== 'monthly') continue;
    if (!expense.due_date) continue;

    pushPaymentReminder(items, {
      idPrefix: `expense-${expense.expense_id}`,
      name: expense.name,
      amount: expense.amount,
      dueDate: expense.due_date,
      frequency: 'monthly',
      type: 'payment',
    });
  }

  return items;
}

export function buildSubscriptionNotifications(subscriptions = []) {
  const items = [];

  for (const sub of subscriptions) {
    if (sub.active === false) continue;
    pushPaymentReminder(items, {
      idPrefix: `sub-${sub.id}`,
      name: sub.name,
      amount: sub.amount,
      dueDay: sub.due_day ?? 1,
      frequency: 'monthly',
      type: 'subscription',
    });
  }

  return items;
}

export function buildSystemNotifications(crisis) {
  if (!crisis || crisis.state === 'NORMAL') return [];

  return [{
    id: `system-crisis-${crisis.state}-${startOfDay().toISOString().slice(0, 10)}`,
    type: 'system',
    severity: crisis.state === 'CRISIS' ? 'error' : 'warning',
    title: statusLabel(crisis.state),
    message: crisis.message,
    dueDate: null,
    daysUntil: crisis.days_remaining,
    amount: 0,
    sourceName: 'Balance outlook',
  }];
}

export function buildAllNotifications(expenses, crisis, subscriptions = []) {
  const dismissed = getDismissedNotificationIds();
  const all = [
    ...buildPaymentNotifications(expenses),
    ...buildSubscriptionNotifications(subscriptions),
    ...buildSystemNotifications(crisis),
  ];

  return all
    .filter((n) => !dismissed.has(n.id))
    .sort((a, b) => (a.daysUntil ?? 99) - (b.daysUntil ?? 99));
}
