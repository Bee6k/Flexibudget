import { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { formatCurrency } from '../../utils/currency';
import { metricValueSx } from './MoneyText';
import GlassCard from './GlassCard';
import { NAVY, TEAL } from '../../theme/surfaces';
import { useThemeMode } from '../../context/ThemeContext';

export function AnimatedCounter({ value, duration = 900, variant = 'h3', color }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let frame;

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <Typography variant={variant} sx={{ ...metricValueSx, color, fontSize: { xs: '1.15rem', sm: 'clamp(1.35rem, 3vw, 2.125rem)' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
      {formatCurrency(display)}
    </Typography>
  );
}

export function MetricLabel({ children }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
      {children}
    </Typography>
  );
}

export function KpiCard({ title, value, subtitle, accent, children, className, delay = 0 }) {
  const { mode } = useThemeMode();
  const defaultAccent = mode === 'dark' ? TEAL : NAVY;

  return (
    <GlassCard
      accent={accent || defaultAccent}
      className={`animate-stagger-item ${className || ''}`}
      sx={{
        p: { xs: 2.5, md: 3 },
        minHeight: { xs: 'auto', md: 148 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        animationDelay: `${delay}s`,
      }}
    >
      <MetricLabel>{title}</MetricLabel>
      <Box sx={{ minWidth: 0 }}>{value}</Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.55 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </GlassCard>
  );
}
