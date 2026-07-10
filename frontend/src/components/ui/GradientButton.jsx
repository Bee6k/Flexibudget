import { Button } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL, TEAL_LIGHT } from '../../theme/surfaces';

/** Primary CTA — solid, professional. */
export default function GradientButton({ children, shimmer = false, sx, ...props }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? TEAL : NAVY;
  const hover = isDark ? TEAL_LIGHT : '#2E5077';

  return (
    <Button
      variant="contained"
      sx={{
        background: bg,
        color: '#FFFFFF',
        fontWeight: 600,
        py: 1.25,
        px: 2.5,
        borderRadius: 2.5,
        boxShadow: 'none',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          background: hover,
          boxShadow: isDark ? '0 4px 14px rgba(45,212,191,0.28)' : '0 4px 12px rgba(30,58,95,0.2)',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0)' },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
