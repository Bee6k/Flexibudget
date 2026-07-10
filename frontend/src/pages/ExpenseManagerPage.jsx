import { useMemo, useState } from 'react';
import { Box, Button, Grid, Paper, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/ui/PageHeader';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { DonutAllocationChart } from '../components/charts/FinanceCharts';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { useToast } from '../context/ToastContext';
import { createExpense, updateExpense, deleteExpense } from '../services/expenses';
import { formatCurrency } from '../utils/currency';
import { CHART_PALETTE } from '../theme/financialColors';
import { priorityLabel } from '../utils/copy';

export default function ExpenseManagerPage() {
  const finance = useFinanceView();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState({ open: false, initial: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const topCategories = useMemo(() => {
    const map = new Map();
    (finance?.view?.expenses || []).forEach((e) => {
      const key = priorityLabel(e.priority_tier);
      map.set(key, (map.get(key) || 0) + Number(e.amount));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [finance?.view?.expenses]);

  if (!finance) return <FinanceUnavailable />;

  const { view, refresh } = finance;
  const monthlyBurn = (view.horizon?.daily_burn_rate || 0) * 30;

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteExpense(pendingDelete.expense_id);
      await refresh();
      showToast(`Removed “${pendingDelete.name}”.`);
      setPendingDelete(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not remove expense.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      <PageHeader
        title="Expense Manager"
        subtitle="Review and manage what you spend, grouped by priority. Use Remove on any row to delete."
        action={(
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, initial: null })}>
            Add expense
          </Button>
        )}
      />
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Active expenses</Typography>
            <Typography variant="h4" fontWeight={700}>{view.expenses.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Monthly burn</Typography>
            <Typography variant="h4" fontWeight={700}>{formatCurrency(monthlyBurn)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Top tiers</Typography>
            <Stack spacing={1}>
              {topCategories.map(([name, amt], i) => (
                <Stack key={name} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{name}</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: CHART_PALETTE[i] }}>{formatCurrency(amt)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <ExpenseList
            expenses={view.expenses}
            onEdit={(e) => setDialog({ open: true, initial: e })}
            onAdd={() => setDialog({ open: true, initial: null })}
            onDelete={(e) => setPendingDelete(e)}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Expense breakdown</Typography>
            <DonutAllocationChart tiers={view.allocation?.tiers} />
          </Paper>
        </Grid>
      </Grid>
      <ExpenseForm
        open={dialog.open}
        initial={dialog.initial}
        onClose={() => setDialog({ open: false, initial: null })}
        onSubmit={async (payload) => {
          if (dialog.initial) await updateExpense(dialog.initial.expense_id, payload);
          else await createExpense(payload);
          await refresh();
          showToast(dialog.initial ? 'Expense updated.' : 'Expense added.');
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove expense?"
        message={`“${pendingDelete?.name}” will be removed from your budget. Runway and allocation will update.`}
        confirmLabel="Remove"
        loading={deleting}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
