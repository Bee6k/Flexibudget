import { useMemo } from 'react';
import { Box, Grid, Paper, Typography, Chip, Stack } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { formatCurrency } from '../utils/currency';
import { formatShortDate, parseDateOnly } from '../utils/dates';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FinancialCalendarPage() {
  const finance = useFinanceView();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map = {};
    (finance?.view?.expenses || []).forEach((e) => {
      const parts = parseDateOnly(e.due_date);
      if (!parts || parts.month !== month || parts.year !== year) return;
      map[parts.day] = [...(map[parts.day] || []), { type: 'bill', label: e.name, amount: e.amount }];
    });
    (finance?.view?.incomes || []).forEach((i) => {
      const parts = parseDateOnly(i.expected_date);
      if (!parts || parts.month !== month || parts.year !== year) return;
      map[parts.day] = [...(map[parts.day] || []), { type: 'income', label: i.source_name, amount: i.amount }];
    });
    return map;
  }, [finance?.view, month, year]);

  if (!finance) return <FinanceUnavailable />;

  const { view } = finance;

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  return (
    <Box>
      <PageHeader title="Financial Calendar" subtitle="Bills, income, and reminders in one monthly view." />
      <Paper sx={{ p: { xs: 1.5, sm: 2.5 }, overflowX: 'auto' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <Grid container columns={7} spacing={0.5} sx={{ minWidth: { xs: 520, sm: 0 } }}>
          {DAYS.map((d) => (
            <Grid item xs={1} key={d}>
              <Typography variant="caption" color="text.secondary" align="center" display="block" fontWeight={700}>{d}</Typography>
            </Grid>
          ))}
          {cells.map((day, idx) => (
            <Grid item xs={1} key={idx}>
              <Box
                sx={{
                  minHeight: { xs: 64, sm: 88 },
                  p: 0.75,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: day === now.getDate() ? 'primary.main' : 'divider',
                  bgcolor: day ? 'background.paper' : 'transparent',
                }}
              >
                {day && (
                  <>
                    <Typography variant="caption" fontWeight={700}>{day}</Typography>
                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                      {(eventsByDay[day] || []).slice(0, 2).map((ev, i) => (
                        <Chip
                          key={i}
                          size="small"
                          label={ev.label}
                          color={ev.type === 'income' ? 'success' : 'default'}
                          sx={{ height: 18, fontSize: '0.65rem', maxWidth: '100%' }}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[...(view.expenses || []), ...(view.incomes || [])].slice(0, 6).map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={600}>{item.name || item.source_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatShortDate(item.due_date || item.expected_date)} · {formatCurrency(item.amount)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
