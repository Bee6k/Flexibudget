import { createTheme, alpha } from '@mui/material/styles';
import { NAVY, NAVY_LIGHT, TEAL, TEAL_LIGHT, TEAL_SOFT, CONTRAST } from './surfaces';

export function createFlexiTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  const darkBorder = CONTRAST.darkBorder;
  const darkBorderStrong = CONTRAST.darkBorderStrong;
  const darkShadow = CONTRAST.darkShadow;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? TEAL_SOFT : NAVY,
        light: isDark ? '#5EEAD4' : NAVY_LIGHT,
        dark: isDark ? TEAL : '#152A45',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? CONTRAST.darkMuted : CONTRAST.lightMuted,
        light: '#CBD5E1',
        dark: '#334155',
      },
      success: { main: isDark ? '#34D399' : '#059669' },
      warning: { main: isDark ? '#FBBF24' : '#D97706' },
      error: { main: isDark ? '#F87171' : '#DC2626' },
      info: { main: isDark ? '#7DD3FC' : '#0284C7' },
      background: {
        default: isDark ? CONTRAST.darkBg : CONTRAST.lightBg,
        paper: isDark ? CONTRAST.darkPaper : CONTRAST.lightPaper,
      },
      divider: isDark ? darkBorder : 'rgba(15, 23, 42, 0.1)',
      text: {
        primary: isDark ? CONTRAST.darkText : CONTRAST.lightText,
        secondary: isDark ? CONTRAST.darkMuted : CONTRAST.lightMuted,
      },
      action: {
        hover: isDark ? 'rgba(148, 183, 210, 0.08)' : 'rgba(15, 23, 42, 0.04)',
        selected: isDark ? alpha(TEAL_SOFT, 0.14) : alpha(NAVY, 0.08),
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
      isDark ? `0 1px 2px ${darkShadow}` : '0 1px 2px rgba(15,23,42,0.05)',
      isDark ? `0 4px 14px ${darkShadow}` : '0 4px 12px rgba(15,23,42,0.06)',
      isDark ? `0 8px 28px ${darkShadow}` : '0 8px 24px rgba(15,23,42,0.08)',
      ...Array(21).fill(isDark ? `0 14px 36px ${darkShadow}` : '0 12px 32px rgba(15,23,42,0.1)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#3D4F6A #0C1424' : '#CBD5E1 #F1F5F9',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: isDark ? CONTRAST.darkPaper : '#FFFFFF',
            border: `1px solid ${isDark ? darkBorder : 'rgba(15,23,42,0.08)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? darkBorder : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDark
              ? `0 1px 2px ${darkShadow}, 0 8px 24px rgba(4,12,28,0.28)`
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
              boxShadow: isDark ? `0 6px 18px ${alpha(TEAL_SOFT, 0.28)}` : '0 4px 12px rgba(30,58,95,0.2)',
            },
            '&.Mui-disabled': {
              background: isDark ? 'rgba(148,183,210,0.12)' : 'rgba(15,23,42,0.1)',
              color: isDark ? 'rgba(232,237,245,0.35)' : 'rgba(15,23,42,0.35)',
            },
          },
          containedSuccess: {
            background: isDark ? '#059669' : '#047857',
            '&:hover': { background: isDark ? '#10B981' : '#059669' },
          },
          outlined: {
            borderWidth: 1,
            borderColor: isDark ? alpha(TEAL_SOFT, 0.4) : alpha(NAVY, 0.25),
            color: isDark ? TEAL_SOFT : NAVY,
            '&:hover': {
              borderWidth: 1,
              borderColor: isDark ? TEAL_SOFT : NAVY,
              bgcolor: isDark ? alpha(TEAL_SOFT, 0.1) : alpha(NAVY, 0.04),
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
            '&:hover': { bgcolor: isDark ? 'rgba(148,183,210,0.1)' : 'rgba(15,23,42,0.05)' },
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
              background: isDark ? alpha(CONTRAST.darkElevated, 0.6) : 'transparent',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? alpha(TEAL_SOFT, 0.45) : alpha(NAVY, 0.35),
              },
              '&.Mui-focused': {
                boxShadow: isDark ? `0 0 0 3px ${alpha(TEAL_SOFT, 0.2)}` : `0 0 0 3px ${alpha(NAVY, 0.1)}`,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? TEAL_SOFT : NAVY,
                borderWidth: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? darkBorder : undefined,
              },
            },
            '& .MuiInputLabel-root': { fontWeight: 500 },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? CONTRAST.darkElevated : '#FFFFFF',
            borderRight: `1px solid ${isDark ? darkBorder : 'rgba(15,23,42,0.08)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: isDark ? alpha(CONTRAST.darkElevated, 0.92) : '#FFFFFF',
            backdropFilter: isDark ? 'blur(12px)' : 'none',
            borderBottom: `1px solid ${isDark ? darkBorder : 'rgba(15,23,42,0.08)'}`,
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
            background: isDark ? CONTRAST.darkPaper : '#FFFFFF',
            border: `1px solid ${isDark ? darkBorderStrong : 'rgba(15,23,42,0.08)'}`,
            borderRadius: 16,
            boxShadow: isDark ? `0 28px 56px ${darkShadow}` : '0 24px 48px rgba(15,23,42,0.12)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 500 },
          standardSuccess: {
            bgcolor: isDark ? alpha('#34D399', 0.12) : alpha('#059669', 0.08),
            color: isDark ? '#6EE7B7' : '#047857',
          },
          standardWarning: {
            bgcolor: isDark ? alpha('#FBBF24', 0.12) : alpha('#D97706', 0.08),
          },
          standardError: {
            bgcolor: isDark ? alpha('#F87171', 0.12) : alpha('#DC2626', 0.08),
          },
          standardInfo: {
            bgcolor: isDark ? alpha('#7DD3FC', 0.12) : alpha('#0284C7', 0.08),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { padding: '14px 16px', borderColor: isDark ? darkBorder : 'rgba(15,23,42,0.06)' },
          head: {
            fontWeight: 600,
            color: isDark ? CONTRAST.darkMuted : '#64748B',
            background: isDark ? CONTRAST.darkElevated : '#F8FAFC',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even)': { bgcolor: isDark ? 'rgba(148,183,210,0.04)' : '#F8FAFC' },
            '&:hover': { bgcolor: isDark ? 'rgba(148,183,210,0.07)' : 'rgba(15,23,42,0.02)' },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 6, bgcolor: isDark ? 'rgba(148,183,210,0.12)' : 'rgba(15,23,42,0.06)' },
          bar: { borderRadius: 999 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${isDark ? darkBorderStrong : 'rgba(15,23,42,0.08)'}`,
            background: isDark ? CONTRAST.darkPaper : undefined,
            boxShadow: isDark ? `0 14px 36px ${darkShadow}` : '0 12px 32px rgba(15,23,42,0.1)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: { borderRadius: 14, boxShadow: isDark ? `0 8px 24px ${darkShadow}` : '0 8px 24px rgba(15,23,42,0.15)' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.75rem',
            bgcolor: isDark ? CONTRAST.darkElevated : undefined,
            border: isDark ? `1px solid ${darkBorder}` : undefined,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            bgcolor: isDark ? 'rgba(148,183,210,0.1)' : 'rgba(15,23,42,0.06)',
            borderRadius: 8,
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          separator: { mx: 0.5 },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: '10px !important',
            '&:before': { display: 'none' },
            border: `1px solid ${isDark ? darkBorder : 'rgba(15,23,42,0.06)'}`,
            mb: 1,
          },
        },
      },
      MuiSnackbar: {
        defaultProps: { autoHideDuration: 3200 },
      },
    },
  });
}
