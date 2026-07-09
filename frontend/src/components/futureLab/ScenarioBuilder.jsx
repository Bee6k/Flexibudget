import { Box, Typography, Stack, Button, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { SCENARIO_CARDS } from '../../utils/futureLabEngine';

export default function ScenarioBuilder({ onSelect }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>What might happen?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tap a life event — we will simulate it for you.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        {SCENARIO_CARDS.map((card) => (
          <GlassCard
            key={card.id}
            onClick={() => onSelect(card)}
            sx={{
              p: 2,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: (t) => `0 12px 32px ${alpha(t.palette.primary.main, 0.15)}`,
              },
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(card)}
          >
            <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{card.emoji}</Typography>
            <Typography variant="body2" fontWeight={800} lineHeight={1.3}>{card.label}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {card.desc}
            </Typography>
          </GlassCard>
        ))}
      </Box>
    </Box>
  );
}
