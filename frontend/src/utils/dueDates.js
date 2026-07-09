export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(from, to) {
  const a = startOfDay(from);
  const b = startOfDay(to);
  return Math.round((b - a) / 86400000);
}

/** Next calendar occurrence from a YYYY-MM-DD anchor or monthly day-of-month (1–28). */
export function nextDueDate({ dueDate, dueDay, frequency = 'monthly' }, from = new Date()) {
  const today = startOfDay(from);

  if (dueDate) {
    let next = startOfDay(new Date(dueDate));
    if (Number.isNaN(next.getTime())) return null;

    if (frequency === 'monthly' || frequency === 'weekly') {
      while (next < today) {
        if (frequency === 'weekly') next.setDate(next.getDate() + 7);
        else next.setMonth(next.getMonth() + 1);
      }
      return next;
    }

    if (frequency === 'yearly') {
      while (next < today) next.setFullYear(next.getFullYear() + 1);
      return next;
    }

    return next >= today ? next : null;
  }

  if (dueDay) {
    const day = Math.min(28, Math.max(1, Number(dueDay)));
    const candidate = new Date(today.getFullYear(), today.getMonth(), day);
    if (candidate >= today) return candidate;
    return new Date(today.getFullYear(), today.getMonth() + 1, day);
  }

  return null;
}

export function formatDueLabel(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
