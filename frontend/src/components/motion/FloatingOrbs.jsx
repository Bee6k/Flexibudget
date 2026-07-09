import { Box, alpha } from '@mui/material';

export default function FloatingOrbs({ color = '#2DD4BF', secondary = '#6366F1' }) {
  const orbs = [
    { size: { xs: 220, md: 340 }, top: '8%', left: '6%', delay: '0s', duration: '16s', c: color },
    { size: { xs: 180, md: 280 }, top: '55%', left: '62%', delay: '1.2s', duration: '20s', c: secondary },
    { size: { xs: 140, md: 200 }, top: '30%', left: '42%', delay: '2.4s', duration: '14s', c: '#06B6D4' },
  ];

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(orb.c, 0.28)} 0%, transparent 68%)`,
            animation: `floatOrb ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
            top: orb.top,
            left: orb.left,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </Box>
  );
}
