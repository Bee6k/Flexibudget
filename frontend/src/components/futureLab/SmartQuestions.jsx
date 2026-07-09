import { useState } from 'react';
import { Stack, TextField, Button, IconButton, Typography, alpha } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GlassCard from '../ui/GlassCard';

const SUGGESTIONS = [
  'What if I lose my job?',
  'What if I get NPR 50,000 bonus?',
  'What if I have a medical emergency?',
  'What if my rent increases?',
  'What if I buy a new phone?',
];

export default function SmartQuestions({ onAsk, lastMessage }) {
  const [text, setText] = useState('');

  function submit(q) {
    const query = q || text.trim();
    if (!query) return;
    onAsk(query);
    setText('');
  }

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>Ask in plain English</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type a question — we build the scenario for you.
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder='e.g. "What if I lose my largest client?"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton
          color="primary"
          onClick={() => submit()}
          sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}
        >
          <SendRoundedIcon />
        </IconButton>
      </Stack>
      {lastMessage && (
        <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600, color: 'primary.main' }}>
          {lastMessage}
        </Typography>
      )}
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
        {SUGGESTIONS.map((s) => (
          <Button
            key={s}
            size="small"
            variant="outlined"
            onClick={() => submit(s)}
            sx={{ borderRadius: 99, textTransform: 'none', fontWeight: 600 }}
          >
            {s}
          </Button>
        ))}
      </Stack>
    </GlassCard>
  );
}
