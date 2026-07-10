import { useMemo, useState } from 'react';
import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL_SOFT } from '../../theme/surfaces';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate, formatDate } from '../../utils/dates';

/**
 * Watch the future — click a date (calendar-style) instead of scrubbing a slider.
 */
export default function InteractiveTimeline({ milestones }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const accent = isDark ? TEAL_SOFT : NAVY;
  const list = milestones || [];
  const [index, setIndex] = useState(0);

  const current = list[index] || list[0];
  const incomeTotal = useMemo(() => {
    if (!current) return 0;
    if (current.incomesHere?.length) {
      return current.incomesHere.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    }
    return Number(current.incomeReceived) || 0;
  }, [current]);

  if (!current) return null;

  return (
    <GlassCard hover={false} sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <EventAvailableOutlinedIcon sx={{ color: accent, fontSize: 22 }} />
        <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
          Watch the future
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: { xs: 'none', sm: 'block' } }}>
        Pick a date below — see your projected balance and any income due around then.
      </Typography>

      {/* Calendar-style date chips */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 1.25,
          mb: 2.5,
        }}
      >
        {list.map((m, i) => {
          const selected = i === index;
          const hasIncome = (m.incomesHere?.length > 0) || (Number(m.incomeReceived) > 0);
          return (
            <Box
              key={m.key || i}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => e.key === 'Enter' && setIndex(i)}
              sx={{
                borderRadius: 2.5,
                cursor: 'pointer',
                textAlign: 'left',
                border: `2px solid ${selected ? accent : (isDark ? 'rgba(148,183,210,0.16)' : 'rgba(15,23,42,0.1)')}`,
                bgcolor: selected
                  ? alpha(accent, isDark ? 0.16 : 0.08)
                  : (isDark ? alpha('#fff', 0.03) : '#fff'),
                boxShadow: selected ? `0 0 0 3px ${alpha(accent, 0.18)}` : 'none',
                transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  borderColor: accent,
                  bgcolor: alpha(accent, isDark ? 0.1 : 0.05),
                },
                minHeight: { xs: 72, sm: 88 },
                display: 'flex',
                flexDirection: 'column',
                gap: 0.35,
                p: { xs: 1.25, sm: 1.5 },
              }}
            >
              <Typography variant="caption" fontWeight={700} color={selected ? accent : 'text.secondary'} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {m.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {m.date ? formatShortDate(m.date) : '—'}
              </Typography>
              {hasIncome ? (
                <Typography variant="caption" fontWeight={700} color="success.main">
                  Income due
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Tap to view
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Selected day detail */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          bgcolor: isDark ? alpha(accent, 0.08) : alpha(NAVY, 0.04),
          border: `1px solid ${isDark ? alpha(accent, 0.28) : alpha(NAVY, 0.12)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {current.label}
            </Typography>
            {current.date && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {formatDate(current.date)}
              </Typography>
            )}
          </Box>
          {current.warning && (
            <Chip
              size="small"
              icon={<span>{current.warning.icon}</span>}
              label={current.warning.text}
              color="warning"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          Projected balance
        </Typography>
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2.5, letterSpacing: '-0.02em' }}>
          {current.balance != null ? formatCurrency(current.balance) : '—'}
        </Typography>

        <Box
          sx={{
            p: 1.75,
            mb: 2,
            borderRadius: 2,
            bgcolor: isDark ? alpha('#34D399', 0.08) : alpha('#059669', 0.06),
            border: `1px solid ${alpha('#34D399', isDark ? 0.25 : 0.2)}`,
          }}
        >
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            Future income on / near this date
          </Typography>
          {current.incomesHere?.length ? (
            <Stack spacing={0.75} sx={{ mt: 0.75 }}>
              {current.incomesHere.map((inc, i) => (
                <Stack key={`${inc.name}-${i}`} direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    💰 {inc.name}
                    {inc.recurring ? ' · recurring' : ''}
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="success.main" sx={{ whiteSpace: 'nowrap' }}>
                    {formatCurrency(inc.amount)}
                  </Typography>
                </Stack>
              ))}
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ pt: 0.5 }}>
                Total in this window: {formatCurrency(incomeTotal)}
              </Typography>
            </Stack>
          ) : incomeTotal > 0 ? (
            <Typography variant="body2" fontWeight={700} color="success.main" sx={{ mt: 0.75 }}>
              💰 Income received: {formatCurrency(incomeTotal)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              No scheduled income lands on this date. Pick another day to check.
            </Typography>
          )}
        </Box>

        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          What else happens
        </Typography>
        <Stack spacing={0.75} sx={{ mt: 0.75 }}>
          {current.events?.length ? (
            current.events.map((ev, i) => (
              <Typography key={i} variant="body2" fontWeight={600}>
                {ev.icon} {ev.text}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Quiet period — no extra bills tagged for this stop.
            </Typography>
          )}
        </Stack>
      </Box>
    </GlassCard>
  );
}
