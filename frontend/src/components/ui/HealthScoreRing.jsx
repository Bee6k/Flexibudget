import { Box, Typography, alpha } from '@mui/material';
import { healthScoreColor } from '../../theme/financialColors';

export default function HealthScoreRing({ score, size = 132 }) {
  const color = healthScoreColor(score);
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        animation: 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          background: alpha(color, 0.08),
          boxShadow: `0 0 32px ${alpha(color, 0.25)}`,
        }}
      />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={7} opacity={0.1} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {score}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          HEALTH
        </Typography>
      </Box>
      {score >= 80 && (
        <Box
          sx={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: alpha(color, 0.2),
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
}
