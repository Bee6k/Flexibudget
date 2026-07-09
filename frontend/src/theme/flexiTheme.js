import { createTheme, alpha } from '@mui/material/styles';
import { NAVY, NAVY_LIGHT, TEAL, TEAL_LIGHT } from './surfaces';

export function createFlexiTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? TEAL_LIGHT : NAVY,
        light: isDark ? '#5EEAD4' : NAVY_LIGHT,
        dark: isDark ? TEAL : '#152A45',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#94A3B8' : '#475569',
        light: '#CBD5E1',
        dark: '#334155',
      },
      success: { main: isDark ? '#34D399' : '#059669' },
      warning: { main: isDark ? '#FBBF24' : '#D97706' },
      error: { main: isDark ? '#F87171' : '#DC2626' },
      info: { main: isDark ? '#38BDF8' : '#0284C7' },
      background: {
        default: isDark ? '#0B1120' : '#F1F5F9',
        paper: isDark ? '#121A2B' : '#FFFFFF',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
        selected: isDark ? alpha(TEAL_LIGHT, 0.12) : alpha(NAVY, 0.08),
      },
    },
    spacing: 8,
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, fontSize: '2.25rem' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, fontSize: '1.875rem' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h4: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.45 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      overline: { fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.6875rem', textTransform: 'uppercase' },
      button: { fontWeight: 600, letterSpacing: '0.01em', fontSize: '0.875rem' },
      caption: { lineHeight: 1.5 },
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(15,23,42,0.05)',
      isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(15,23,42,0.06)',
      isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(15,23,42,0.08)',
      ...Array(21).fill(isDark ? '0 12px 32px rgba(0,0,0,0.35)' : '0 12px 32px rgba(15,23,42,0.1)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#334155 #0B1120' : '#CBD5E1 #F1F5F9',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: isDark ? '#121A2B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            padding: '9px 20px',
            minHeight: 40,
            transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          },
          contained: {
            background: isDark ? TEAL : NAVY,
            color: '#FFFFFF',
            boxShadow: 'none',
            '&:hover': {
              background: isDark ? TEAL_LIGHT : '#2E5077',
              boxShadow: isDark ? '0 4px 12px rgba(45,212,191,0.25)' : '0 4px 12px rgba(30,58,95,0.2)',
            },
          },
          containedSuccess: {
            background: isDark ? '#059669' : '#047857',
            '&:hover': { background: isDark ? '#10B981' : '#059669' },
          },
          outlined: {
            borderWidth: 1,
            borderColor: isDark ? alpha(TEAL_LIGHT, 0.4) : alpha(NAVY, 0.25),
            '&:hover': {
              borderWidth: 1,
              borderColor: isDark ? TEAL_LIGHT : NAVY,
              bgcolor: isDark ? alpha(TEAL_LIGHT, 0.08) : alpha(NAVY, 0.04),
            },
          },
          sizeSmall: { minHeight: 34, padding: '6px 14px', fontSize: '0.8125rem' },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8, height: 28 },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              minHeight: 42,
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? alpha(TEAL_LIGHT, 0.45) : alpha(NAVY, 0.35),
              },
              '&.Mui-focused': {
                boxShadow: isDark ? `0 0 0 3px ${alpha(TEAL_LIGHT, 0.18)}` : `0 0 0 3px ${alpha(NAVY, 0.1)}`,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? TEAL_LIGHT : NAVY,
                borderWidth: 1,
              },
            },
            '& .MuiInputLabel-root': { fontWeight: 500 },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? '#0E1526' : '#FFFFFF',
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: isDark ? '#0B1120' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'background-color 0.2s ease',
            marginBottom: 2,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark ? '#121A2B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            borderRadius: 16,
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15,23,42,0.12)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 500 },
          standardSuccess: {
            bgcolor: isDark ? alpha('#34D399', 0.1) : alpha('#059669', 0.08),
            color: isDark ? '#6EE7B7' : '#047857',
          },
          standardWarning: {
            bgcolor: isDark ? alpha('#FBBF24', 0.1) : alpha('#D97706', 0.08),
          },
          standardError: {
            bgcolor: isDark ? alpha('#F87171', 0.1) : alpha('#DC2626', 0.08),
          },
          standardInfo: {
            bgcolor: isDark ? alpha('#38BDF8', 0.1) : alpha('#0284C7', 0.08),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { padding: '14px 16px', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' },
          head: { fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', background: isDark ? '#0E1526' : '#F8FAFC' },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even)': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' },
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.02)' },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 6, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' },
          bar: { borderRadius: 999 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 12px 32px rgba(15,23,42,0.1)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: { borderRadius: 14, boxShadow: '0 8px 24px rgba(15,23,42,0.15)' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontWeight: 500, fontSize: '0.75rem' },
        },
      },
    },
  });
}
