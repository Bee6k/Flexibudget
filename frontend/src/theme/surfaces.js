/** Design tokens — navy/teal with mode-aware contrast (color theory).
 *
 * Light: cool slate ground → white elevation → deep navy type/accent.
 * Dark:  deep navy-slate ground → lifted blue-slate cards → soft cool type → teal accent.
 */

export const NAVY = '#152A45';
export const NAVY_LIGHT = '#1E3A5F';
export const TEAL = '#0F766E';
export const TEAL_LIGHT = '#14B8A6';
export const TEAL_SOFT = '#2DD4BF';
export const SLATE = '#64748B';
export const SURFACE_LIGHT = '#F8FAFC';
export const SURFACE_BORDER = 'rgba(15, 23, 42, 0.1)';

export const CONTRAST = {
  /* Dark — blue-slate stack (mirrors light’s cool gray → white lift) */
  darkBg: '#0C1424',
  darkElevated: '#111B2E',
  darkPaper: '#172338',
  darkText: '#E8EDF5',
  darkMuted: '#9AA8BC',
  darkBorder: 'rgba(148, 183, 210, 0.14)',
  darkBorderStrong: 'rgba(148, 183, 210, 0.22)',
  darkShadow: 'rgba(4, 12, 28, 0.55)',

  /* Light — keep the stunning baseline */
  lightBg: '#F1F5F9',
  lightPaper: '#FFFFFF',
  lightText: '#0F172A',
  lightMuted: '#475569',
  lightBorder: SURFACE_BORDER,
  lightShadow: 'rgba(15, 23, 42, 0.08)',
};

export const GRADIENT_PRIMARY = TEAL;
export const GRADIENT_PRIMARY_HOVER = TEAL_LIGHT;

export function cardSurface(isDark) {
  return {
    background: isDark ? CONTRAST.darkPaper : CONTRAST.lightPaper,
    border: `1px solid ${isDark ? CONTRAST.darkBorder : CONTRAST.lightBorder}`,
    boxShadow: isDark
      ? `0 1px 2px ${CONTRAST.darkShadow}, 0 12px 32px rgba(4, 12, 28, 0.35)`
      : '0 1px 2px rgba(15,23,42,0.05), 0 10px 28px rgba(15,23,42,0.07)',
  };
}

export function glassSurface(isDark) {
  return cardSurface(isDark);
}

export function futureLabSurface(isDark) {
  return {
    ...cardSurface(isDark),
    borderLeft: `4px solid ${isDark ? '#FBBF24' : '#F59E0B'}`,
    background: isDark
      ? `linear-gradient(90deg, rgba(251,191,36,0.09) 0%, ${CONTRAST.darkPaper} 16%)`
      : 'linear-gradient(90deg, rgba(245,158,11,0.07) 0%, #FFFFFF 14%)',
  };
}

export function hoverLift(accent) {
  return {
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 14px 32px ${accent || 'rgba(15, 23, 42, 0.1)'}`,
    },
  };
}

export function gradientBorder() {
  return {};
}
