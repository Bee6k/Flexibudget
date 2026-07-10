const FORMATTER = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return FORMATTER.format(Number(value));
}

/** Compact axis labels: 1.2K, 2.5M */
export function formatCompactCurrency(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}NPR ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}NPR ${(abs / 1_000).toFixed(1)}K`;
  return formatCurrency(n);
}

export function formatPercent(value, digits = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `${n.toFixed(digits)}%`;
}
