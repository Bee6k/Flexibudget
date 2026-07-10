import { Box, Typography, Stack, alpha } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL_SOFT, CONTRAST } from '../../theme/surfaces';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';

/**
 * Money journey — clean horizontal stops with clear gaps (no road line through cards).
 */
export default function MoneyJourney({ nodes }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const accent = isDark ? TEAL_SOFT : NAVY;
  const list = nodes || [];

  if (!list.length) return null;

  return (
    <GlassCard hover={false} sx={{ p: { xs: 2, md: 2.5 }, mb: 3, overflow: 'hidden' }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Your money journey
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Each stop is a money event. Scroll sideways to see the full path.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1.5,
          pt: 0.25,
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? alpha('#94A3B8', 0.35) : alpha(NAVY, 0.2),
            borderRadius: 99,
          },
        }}
      >
        {list.map((node, i) => (
          <Box
            key={node.id || i}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
            }}
          >
            <JourneyNode node={node} accent={accent} isDark={isDark} />
            {i < list.length - 1 && (
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  px: 0.5,
                }}
              >
                <EastRoundedIcon
                  sx={{
                    fontSize: 18,
                    color: isDark ? alpha('#94A3B8', 0.55) : alpha(NAVY, 0.3),
                  }}
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Stack direction="row" spacing={2.5} sx={{ mt: 1.75, flexWrap: 'wrap', rowGap: 1 }}>
        <LegendDot color="#34D399" label="Money in" />
        <LegendDot color="#F87171" label="Money out" />
        <LegendDot color="#EF4444" label="Critical" />
      </Stack>
    </GlassCard>
  );
}

function LegendDot({ color, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
    </Stack>
  );
}

function JourneyNode({ node, accent, isDark }) {
  const isNeg = node.delta != null && node.delta < 0;
  const isPos = node.delta != null && node.delta > 0;
  const isStart = node.id === 'start' || node.label === 'Today';
  const isCritical = node.tone === 'critical';

  const border = isCritical
    ? '#EF4444'
    : node.tone === 'good'
      ? '#34D399'
      : node.tone === 'bad'
        ? '#F87171'
        : isStart
          ? accent
          : (isDark ? CONTRAST.darkBorderStrong : 'rgba(15,23,42,0.12)');

  const balanceLine = isCritical
    ? 'Balance becomes negative'
    : node.amount != null
      ? `Balance ≈ ${formatCompactCurrency(node.amount)}`
      : node.detail;

  return (
    <Box
      sx={{
        width: 200,
        minHeight: 168,
        p: 2,
        borderRadius: 3,
        border: `1.5px solid ${border}`,
        bgcolor: isDark ? CONTRAST.darkPaper : '#FFFFFF',
        backgroundImage: isCritical
          ? `linear-gradient(180deg, ${alpha('#EF4444', isDark ? 0.12 : 0.06)} 0%, transparent 70%)`
          : isStart
            ? `linear-gradient(180deg, ${alpha(accent, isDark ? 0.14 : 0.06)} 0%, transparent 70%)`
            : 'none',
        boxShadow: isDark
          ? '0 2px 12px rgba(4,12,28,0.3)'
          : '0 2px 12px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, width: '100%' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha(NAVY, 0.05),
            fontSize: '1.1rem',
            flexShrink: 0,
          }}
        >
          {node.emoji}
        </Box>
        {isStart && (
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              px: 1,
              py: 0.2,
              borderRadius: 99,
              bgcolor: alpha(accent, 0.16),
              color: accent,
              lineHeight: 1.4,
            }}
          >
            Start
          </Typography>
        )}
      </Stack>

      <Typography
        variant="subtitle2"
        fontWeight={800}
        title={node.label}
        sx={{
          lineHeight: 1.35,
          mb: 1,
          width: '100%',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.7em',
        }}
      >
        {node.label}
      </Typography>

      {node.delta != null ? (
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            color: isPos ? 'success.main' : isNeg ? 'error.main' : 'text.secondary',
            letterSpacing: '-0.015em',
            whiteSpace: 'nowrap',
            fontSize: '0.9rem',
          }}
        >
          {isPos ? '+' : ''}
          {formatCompactCurrency(node.delta)}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ letterSpacing: '-0.015em', whiteSpace: 'nowrap', fontSize: '0.9rem' }}
        >
          {node.amount != null ? formatCompactCurrency(node.amount) : '—'}
        </Typography>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 'auto',
          pt: 1.25,
          lineHeight: 1.4,
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={balanceLine}
      >
        {balanceLine}
      </Typography>
    </Box>
  );
}
