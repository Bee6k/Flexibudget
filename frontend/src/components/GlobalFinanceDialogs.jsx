import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Alert } from '@mui/material';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import { useFinance } from '../context/FinanceContext';
import { createExpense } from '../services/expenses';
import { createIncome } from '../services/incomes';
import { updateBalance } from '../services/users';

export default function GlobalFinanceDialogs() {
  const { quickAdd, setQuickAdd, refresh } = useFinance();
  const [balanceVal, setBalanceVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quickAdd !== 'balance') setBalanceVal('');
    setError('');
  }, [quickAdd]);

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
        }}
      />
      <IncomeForm
        open={quickAdd === 'income'}
        initial={null}
        onClose={() => setQuickAdd(null)}
        onSubmit={async (payload) => {
          await createIncome(payload);
          await refresh();
        }}
      />
      <Dialog open={quickAdd === 'balance'} onClose={() => setQuickAdd(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update current balance</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Balance (NPR)"
            value={balanceVal}
            onChange={(e) => setBalanceVal(e.target.value)}
            sx={{ mt: 1 }}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickAdd(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveBalance} disabled={saving || balanceVal === ''}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
