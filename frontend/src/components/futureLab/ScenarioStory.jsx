import { useEffect, useRef } from 'react';
import { Box, Typography, Stack, alpha } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL_SOFT } from '../../theme/surfaces';

const TONE = {
  good: { border: '#34D399', bg: alpha('#34D399', 0.1) },
  bad: { border: '#F87171', bg: alpha('#F87171', 0.1) },
  neutral: { border: '#94A3B8', bg: alpha('#94A3B8', 0.08) },
  critical: { border: '#EF4444', bg: alpha('#EF4444', 0.15) },
};

/**
 * Scenario simulation — scrollable story list so every applied event stays reachable.
 * Auto-scrolls to the newest step when pulseKey / steps change.
 */
export default function ScenarioStory({ steps, pulseKey = 0, activeLabel }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const accent = isDark ? TEAL_SOFT : NAVY;
  const listRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!steps?.length) return undefined;
    const id = requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [steps?.length, pulseKey]);

  return (
    <GlassCard
      hover={false}
      className={pulseKey > 0 ? 'animate-scale-in' : undefined}
      sx={{
        p: { xs: 2, md: 2.5 },
        height: { md: '100%' },
        minHeight: { md: 480 },
        maxHeight: { xs: '70vh', md: 'min(640px, 78vh)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: pulseKey > 0 ? `2px solid ${alpha(accent, 0.45)}` : undefined,
        boxShadow: pulseKey > 0
          ? `0 0 0 3px ${alpha(accent, 0.12)}, 0 12px 32px ${alpha(accent, 0.12)}`
          : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.5, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoGraphOutlinedIcon sx={{ color: accent, fontSize: 22 }} />
          <Typography variant="h6" fontWeight={800}>
            Simulation
          </Typography>
        </Stack>
        {steps?.length > 0 && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {steps.length} step{steps.length === 1 ? '' : 's'} · scroll for all
          </Typography>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
        {activeLabel
          ? `Showing what happens after: ${activeLabel}`
          : 'Your scenario story updates here when you tap an event.'}
      </Typography>

      {!steps?.length ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2,
            borderRadius: 2.5,
            border: `1px dashed ${isDark ? 'rgba(148,183,210,0.25)' : 'rgba(15,23,42,0.15)'}`,
            bgcolor: isDark ? alpha(accent, 0.04) : alpha(NAVY, 0.03),
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.6 }}>
            Pick a life event on the left — this panel fills with a step-by-step money story.
          </Typography>
        </Box>
      ) : (
        <Box
          ref={listRef}
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 0.5,
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: isDark ? alpha('#94A3B8', 0.4) : alpha(NAVY, 0.22),
              borderRadius: 99,
            },
          }}
        >
          <Stack spacing={0} sx={{ width: '100%', minWidth: 0, pb: 1 }}>
            {steps.map((step, i) => {
              const tone = TONE[step.type === 'good' ? 'good' : step.type === 'bad' ? 'bad' : 'neutral'];
              const isLatest = i === steps.length - 1;
              return (
                <Box
                  key={`${i}-${step.text?.slice(0, 24)}`}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    width: '100%',
                    minWidth: 0,
                    alignItems: 'stretch',
                  }}
                >
                  <Stack alignItems="center" sx={{ width: 20, flexShrink: 0 }}>
                    <Box
                      sx={{
                        width: isLatest ? 12 : 10,
                        height: isLatest ? 12 : 10,
                        borderRadius: '50%',
                        bgcolor: tone.border,
                        mt: 1.25,
                        flexShrink: 0,
                        boxShadow: isLatest ? `0 0 0 4px ${alpha(tone.border, 0.25)}` : 'none',
                      }}
                    />
                    {i < steps.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          minHeight: 12,
                          bgcolor: alpha('#94A3B8', 0.25),
                          my: 0.5,
                        }}
                      />
                    )}
                  </Stack>

                  <Box
                    sx={{
                      flex: '1 1 0%',
                      width: '100%',
                      minWidth: 0,
                      px: 2,
                      py: 1.5,
                      mb: i < steps.length - 1 ? 1.25 : 0,
                      borderRadius: 2,
                      borderLeft: `3px solid ${tone.border}`,
                      bgcolor: tone.bg,
                      outline: isLatest ? `1px solid ${alpha(tone.border, 0.35)}` : 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        lineHeight: 1.65,
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        width: '100%',
                        display: 'block',
                      }}
                    >
                      {step.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <Box ref={endRef} sx={{ height: 1 }} />
          </Stack>
        </Box>
      )}
    </GlassCard>
  );
}
