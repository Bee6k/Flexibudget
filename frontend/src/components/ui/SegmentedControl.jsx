import { Box, ButtonBase, Typography } from '@mui/material';

/**
 * Segmented tab control for chart ranges (Last 7 / 30 / 90 days).
 */
export default function SegmentedControl({ options, value, onChange, ariaLabel = 'Range' }) {
  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        p: 0.5,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        gap: 0.25,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <ButtonBase
            key={opt.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              minHeight: 32,
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
              {opt.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
