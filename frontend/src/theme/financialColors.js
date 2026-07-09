/** Muted fintech palette for metrics and charts. */

const RED = '#DC2626';
const AMBER = '#D97706';
const NAVY = '#1E3A5F';
const TEAL = '#0D9488';
const SLATE = '#64748B';

export function balanceStatusColor(balance) {
  const v = Number(balance) || 0;
  if (v < 0) return RED;
  if (v < 10000) return AMBER;
  if (v < 50000) return NAVY;
  if (v < 150000) return TEAL;
  return '#059669';
}

export function healthScoreColor(score) {
  if (score <= 40) return RED;
  if (score <= 60) return AMBER;
  if (score <= 80) return TEAL;
  return NAVY;
}

export function savingsProgressColor(pct) {
  if (pct < 25) return RED;
  if (pct < 50) return AMBER;
  if (pct < 75) return NAVY;
  return TEAL;
}

export function emergencyFundColor(months) {
  if (months < 1) return RED;
  if (months < 3) return AMBER;
  if (months < 6) return NAVY;
  return TEAL;
}

export function crisisToColor(state) {
  switch (state) {
    case 'CRISIS': return RED;
    case 'CAUTION': return AMBER;
    case 'NORMAL': return TEAL;
    default: return SLATE;
  }
}

export const CHART_PALETTE = ['#0D9488', '#1E3A5F', '#2E5077', '#D97706', '#DC2626', '#0284C7', '#059669'];
