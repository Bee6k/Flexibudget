/** Convert preset amounts to a monthly figure for onboarding (everything saves as monthly). */
export function normalizeToMonthly(amount, frequency = 'monthly') {
  const n = Number(amount) || 0;
  if (frequency === 'weekly') return Math.round((n * 52) / 12);
  if (frequency === 'yearly') return Math.round(n / 12);
  return Math.round(n);
}

export function amountPresets(baseAmount) {
  const base = Math.max(100, Math.round(Number(baseAmount) || 1000));
  return [
    { key: 'light', label: 'Light', amount: Math.round(base * 0.7), hint: 'Spend less' },
    { key: 'typical', label: 'Typical', amount: base, hint: 'Suggested' },
    { key: 'generous', label: 'Generous', amount: Math.round(base * 1.35), hint: 'Spend more' },
  ];
}

export const COMMON_DUE_DAYS = [1, 5, 10, 15, 20, 25, 28];

export function nudgeAmount(current, delta) {
  const n = Math.max(100, (Number(current) || 0) + delta);
  return Math.round(n / 100) * 100;
}
