import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Stack, Avatar, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PageHeader from '../components/ui/PageHeader';
import RecommendationPanel from '../components/RecommendationPanel';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { formatCurrency } from '../utils/currency';
import { deleteExpense } from '../services/expenses';
import { priorityLabel, daysRemainingLabel } from '../utils/copy';

const SUGGESTIONS = [
  'How can I save money?',
  'What is my biggest expense?',
  'Am I overspending?',
  'Can I afford a new laptop?',
];

function buildAnswer(question, view, recommendations) {
  const q = question.toLowerCase();
  const expenses = view?.expenses || [];
  const biggest = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  const burn = (view?.horizon?.daily_burn_rate || 0) * 30;

  if (q.includes('save')) {
    return recommendations?.[0]
      ? `Pausing ${recommendations[0].expense_name} could free about ${formatCurrency(recommendations[0].monthly_cost)} each month. ${recommendations[0].explanation?.consequence}`
      : `Things look steady. If you have extra cash, consider putting ${formatCurrency(Math.max(0, view?.allocation?.surplus || 0))} toward savings.`;
  }
  if (q.includes('biggest')) {
    return biggest
      ? `Your largest cost right now is ${biggest.name} at ${formatCurrency(biggest.amount)} (${biggest.frequency}, ${priorityLabel(biggest.priority_tier)}).`
      : 'Add a few expenses and I can highlight where most of your money goes.';
  }
  if (q.includes('overspend') || q.includes('afford')) {
    const state = view?.crisis?.state;
    return state === 'NORMAL'
      ? `Spending is within a comfortable range — about ${formatCurrency(burn)} per month with ${daysRemainingLabel(view?.horizon?.days_remaining)} of cover.`
      : `${view?.crisis?.message} Start by reviewing optional lifestyle spending.`;
  }
  return `With ${formatCurrency(view?.current_balance)} available, focus on essentials first and keep an eye on your ${daysRemainingLabel(view?.horizon?.days_remaining)} outlook.`;
}

export default function AIInsightsPage() {
  const finance = useFinanceView();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi — these are rules-based tips from your budget data. Ask a question or pick a suggestion below.' },
  ]);

  function ask(text) {
    const q = text || input;
    if (!q.trim() || !finance) return;
    const { view, recommendations } = finance;
    const answer = buildAnswer(q, view, recommendations);
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: answer }]);
    setInput('');
  }

  const topExpense = useMemo(() => {
    return [...(finance?.view?.expenses || [])].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  }, [finance?.view?.expenses]);

  if (!finance) return <FinanceUnavailable />;

  const { view, recommendations, refresh } = finance;

  return (
    <Box>
      <PageHeader
        title="Budget tips"
        subtitle="Rules-based guidance from your spending data — not AI. Ask a question or review suggestions."
      />
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
        <Paper sx={{ flex: 1, p: 2.5, minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            {messages.map((m, i) => (
              <Stack key={i} direction="row" spacing={1.5} justifyContent={m.role === 'user' ? 'flex-end' : 'flex-start'}>
                {m.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: m.role === 'user' ? 'primary.main' : 'action.hover',
                    color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="body2">{m.text}</Typography>
                </Paper>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1.5}>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} size="small" onClick={() => ask(s)} clickable variant="outlined" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="Ask about your finances…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
            />
            <Button variant="contained" onClick={() => ask()} aria-label="Send"><SendIcon /></Button>
          </Stack>
        </Paper>
        <Box sx={{ width: { lg: 360 } }}>
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Quick tip</Typography>
            {topExpense ? (
              <Typography variant="body2">Largest expense: <strong>{topExpense.name}</strong> ({formatCurrency(topExpense.amount)})</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">No expenses tracked yet.</Typography>
            )}
          </Paper>
          <RecommendationPanel
            recommendations={recommendations}
            onAccept={async (rec) => { await deleteExpense(rec.expense_id); await refresh(); }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
