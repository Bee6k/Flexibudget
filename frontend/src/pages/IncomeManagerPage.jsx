import { useState } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/ui/PageHeader';
import IncomeList from '../components/IncomeList';
import IncomeForm from '../components/IncomeForm';
import { AreaCashFlowChart } from '../components/charts/FinanceCharts';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { createIncome, updateIncome, deleteIncome } from '../services/incomes';
import { formatCurrency } from '../utils/currency';

export default function IncomeManagerPage() {
  const finance = useFinanceView();
  const [dialog, setDialog] = useState({ open: false, initial: null });

  if (!finance) return <FinanceUnavailable />;

  const { view, refresh } = finance;

  const total = view.incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const recurring = view.incomes.filter((i) => i.is_recurring);
  const chartData = view.incomes.slice(0, 12).map((i) => ({
    date: i.expected_date,
    balance: Number(i.amount),
  }));

  return (
    <Box>
      <PageHeader
        title="Income Manager"
        subtitle="Track salary, freelance, and recurring inflows."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, initial: null })}>
            Add income
          </Button>
        }
      />
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Total scheduled</Typography>
            <Typography variant="h4" fontWeight={700}>{formatCurrency(total)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Recurring sources</Typography>
            <Typography variant="h4" fontWeight={700}>{recurring.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">One-time events</Typography>
            <Typography variant="h4" fontWeight={700}>{view.incomes.length - recurring.length}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <IncomeList
            incomes={view.incomes}
            onEdit={(i) => setDialog({ open: true, initial: i })}
            onDelete={async (i) => {
              if (window.confirm(`Delete ${i.source_name}?`)) {
                await deleteIncome(i.income_id);
                await refresh();
              }
            }}
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Income timeline</Typography>
            <AreaCashFlowChart data={chartData} dataKey="balance" />
          </Paper>
        </Grid>
      </Grid>
      <IncomeForm
        open={dialog.open}
        initial={dialog.initial}
        onClose={() => setDialog({ open: false, initial: null })}
        onSubmit={async (payload) => {
          if (dialog.initial) await updateIncome(dialog.initial.income_id, payload);
          else await createIncome(payload);
          await refresh();
        }}
      />
    </Box>
  );
}
