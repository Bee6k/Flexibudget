import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Alert, Typography } from '@mui/material';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import QuickManageDialog from './QuickManageDialog';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { createExpense } from '../services/expenses';
import { createIncome } from '../services/incomes';
import { updateBalance } from '../services/users';

export default function GlobalFinanceDialogs() {
  const { quickAdd, setQuickAdd, refresh, view } = useFinance();
  const { showToast } = useToast();
  const [balanceVal, setBalanceVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quickAdd === 'balance') {
      setBalanceVal(view?.current_balance != null ? String(view.current_balance) : '');
    } else {
      setBalanceVal('');
    }
    setError('');
  }, [quickAdd, view?.current_balance]);

  async function saveBalance() {
    const value = Number(balanceVal);
    if (balanceVal === '' || Number.isNaN(value) || value < 0) {
      setError('Enter a valid balance of zero or greater.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateBalance(value);
      await refresh();
      setQuickAdd(null);
      showToast('Balance updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update balance.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ExpenseForm
        open={quickAdd === 'expense'}
        initial={null}
        onClose={() => setQuickAdd(null)}
        onSubmit={async (payload) => {
          await createExpense(payload);
          await refresh();
          showToast('Expense added. Use Manage money anytime to remove it.');
        }}
      />
      <IncomeForm
        open={quickAdd === 'income'}
        initial={null}
        onClose={() => setQuickAdd(null)}
        onSubmit={async (payload) => {
          await createIncome(payload);
          await refresh();
          showToast('Income added. Use Manage money anytime to remove it.');
        }}
      />

      <QuickManageDialog
        open={quickAdd === 'manage' || quickAdd === 'manage-expenses' || quickAdd === 'manage-income'}
        initialTab={quickAdd === 'manage-income' ? 'income' : 'expenses'}
        onClose={() => setQuickAdd(null)}
      />

      <Dialog open={quickAdd === 'balance'} onClose={() => setQuickAdd(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update current balance</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Pre-filled with your current available balance — edit and save.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Balance (NPR)"
            required
            value={balanceVal}
            onChange={(e) => setBalanceVal(e.target.value)}
            sx={{ mt: 0.5 }}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQuickAdd(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveBalance} disabled={saving || balanceVal === ''}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
