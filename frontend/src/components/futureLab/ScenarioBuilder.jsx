import { Box, Typography, Stack, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL_SOFT } from '../../theme/surfaces';
import { SCENARIO_CARDS } from '../../utils/futureLabEngine';

/**
 * Life-event picker — selected / applied states are visually obvious.
 */
export default function ScenarioBuilder({ onSelect, activeId, appliedIds = [] }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const accent = isDark ? TEAL_SOFT : NAVY;
  const applied = new Set(appliedIds);

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        What might happen?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tap a life event — the simulation on the right updates instantly.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
          gap: 1.25,
        }}
      >
        {SCENARIO_CARDS.map((card) => {
          const isActive = activeId === card.id;
          const wasApplied = applied.has(card.id);

          return (
            <GlassCard
              key={card.id}
              hover={false}
              onClick={() => onSelect(card)}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(card)}
              sx={{
                p: 1.75,
                cursor: 'pointer',
                textAlign: 'left',
                border: `2px solid ${
                  isActive
                    ? accent
                    : wasApplied
                      ? alpha(accent, 0.45)
                      : (isDark ? 'rgba(148,183,210,0.14)' : 'rgba(15,23,42,0.08)')
                }`,
                bgcolor: isActive
                  ? alpha(accent, isDark ? 0.16 : 0.08)
                  : wasApplied
                    ? alpha(accent, isDark ? 0.07 : 0.04)
                    : undefined,
                boxShadow: isActive
                  ? `0 0 0 3px ${alpha(accent, 0.22)}, 0 10px 28px ${alpha(accent, 0.18)}`
                  : undefined,
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: accent,
                  bgcolor: alpha(accent, isDark ? 0.12 : 0.06),
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.98)',
                },
              }}
            >
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>{card.emoji}</Typography>
                {(isActive || wasApplied) && (
                  <CheckCircleRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: accent,
                      opacity: isActive ? 1 : 0.7,
                    }}
                  />
                )}
              </Stack>
              <Typography variant="body2" fontWeight={800} lineHeight={1.3} sx={{ mt: 0.75 }}>
                {card.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.35, lineHeight: 1.4 }}>
                {card.desc}
              </Typography>
              {isActive && (
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    display: 'inline-block',
                    mt: 1,
                    px: 1,
                    py: 0.25,
                    borderRadius: 99,
                    bgcolor: alpha(accent, 0.15),
                    color: accent,
                  }}
                >
                  Just applied
                </Typography>
              )}
            </GlassCard>
          );
        })}
      </Box>
    </Box>
  );
}
