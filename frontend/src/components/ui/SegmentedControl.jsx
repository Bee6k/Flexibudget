import { Box, ButtonBase, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Segmented tab control for chart ranges (Last 7 / 30 / 90 days).
 * Uses short labels on phones to avoid wrapping.
 */
export default function SegmentedControl({ options, value, onChange, ariaLabel = 'Range' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        p: 0.4,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        gap: 0.25,
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        const label = isMobile
          ? (opt.shortLabel || opt.label)
          : (opt.fullLabel || opt.label);
        return (
          <ButtonBase
            key={opt.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            sx={{
              px: { xs: 1.25, sm: 1.5 },
              py: 0.75,
              borderRadius: 1.5,
              minHeight: 36,
              minWidth: { xs: 44, sm: 'auto' },
              bgcolor: selected ? 'background.paper' : 'transparent',
              boxShadow: selected ? 1 : 'none',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { bgcolor: selected ? 'background.paper' : 'action.selected' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: selected ? 700 : 500,
                color: selected ? 'text.primary' : 'text.secondary',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
