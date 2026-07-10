/**
 * Date helpers. Prefer local calendar dates for YYYY-MM-DD fields from the API
 * (DATEONLY) — never parse those with `new Date('YYYY-MM-DD')` alone (UTC shift).
 */

export function localDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse API DATEONLY / ISO date string into local Y/M/D parts. */
export function parseDateOnly(value) {
  if (!value) return null;
  const key = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    key,
  };
}

export function formatDate(value) {
  if (!value) return '—';
  const parts = parseDateOnly(value);
  const d = parts
    ? new Date(parts.year, parts.month, parts.day)
    : value instanceof Date
      ? value
      : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShortDate(value) {
  if (!value) return '';
  const parts = parseDateOnly(value);
  const d = parts
    ? new Date(parts.year, parts.month, parts.day)
    : value instanceof Date
      ? value
      : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function toInputDate(value) {
  if (!value) return '';
  const parts = parseDateOnly(value);
  if (parts) return parts.key;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return localDateKey(d);
}
