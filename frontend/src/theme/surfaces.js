/** Design tokens & shared surface styles — premium fintech, restrained palette. */

export const NAVY = '#1E3A5F';
export const NAVY_LIGHT = '#2E5077';
export const TEAL = '#0D9488';
export const TEAL_LIGHT = '#14B8A6';
export const SLATE = '#64748B';
export const SURFACE_LIGHT = '#F8FAFC';
export const SURFACE_BORDER = 'rgba(15, 23, 42, 0.08)';

/** Primary CTA — solid teal (no rainbow gradient). */
export const GRADIENT_PRIMARY = TEAL;
export const GRADIENT_PRIMARY_HOVER = TEAL_LIGHT;

/** Clean elevated card — replaces heavy glassmorphism. */
export function cardSurface(isDark) {
  return {
    background: isDark ? '#121A2B' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : SURFACE_BORDER}`,
    boxShadow: isDark
      ? '0 1px 3px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)'
      : '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
  };
}

/** @deprecated alias — existing components import glassSurface */
export function glassSurface(isDark) {
  return cardSurface(isDark);
}

export function futureLabSurface(isDark) {
  return {
    ...cardSurface(isDark),
    borderLeft: `4px solid ${isDark ? '#D97706' : '#F59E0B'}`,
    background: isDark
      ? 'linear-gradient(90deg, rgba(217,119,6,0.06) 0%, #121A2B 12%)'
      : 'linear-gradient(90deg, rgba(245,158,11,0.06) 0%, #FFFFFF 14%)',
  };
}

export function hoverLift(accent = 'rgba(15, 23, 42, 0.08)') {
  return {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 12px 28px ${accent}`,
    },
  };
}

export function gradientBorder() {
  return {};
}
