import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Alert,
} from '@mui/material';
import { toInputDate } from '../utils/dates';

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
];

const TIERS = [
  { value: 1, label: 'Essentials — rent, food, utilities' },
  { value: 2, label: 'Stability — insurance, transport' },
  { value: 3, label: 'Goals — savings, education' },
  { value: 4, label: 'Lifestyle — dining, subscriptions' },
];

const EMPTY = { name: '', amount: '', frequency: 'monthly', priority_tier: 1, due_date: '' };

export default function ExpenseForm({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name || '',
        amount: initial.amount ?? '',
        frequency: initial.frequency || 'monthly',
        priority_tier: initial.priority_tier ?? 1,
        due_date: toInputDate(initial.due_date),
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [open, initial]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) { setError('Amount must be greater than zero.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        amount,
        frequency: form.frequency,
        priority_tier: Number(form.priority_tier),
        due_date: form.due_date
          || (form.frequency === 'one-time' ? new Date().toISOString().slice(0, 10) : null),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? 'Edit expense' : 'Add expense'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required value={form.name} onChange={update('name')} autoFocus />
          <TextField
            label="Amount" type="number" required value={form.amount} onChange={update('amount')}
            inputProps={{ min: 0, step: '0.01' }}
          />
          <TextField select label="Frequency" value={form.frequency} onChange={update('frequency')}>
            {FREQUENCIES.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
          </TextField>
          <TextField select label="Priority tier" value={form.priority_tier} onChange={update('priority_tier')}>
            {TIERS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField
            label="Due date" type="date" value={form.due_date} onChange={update('due_date')}
            helperText={
              form.frequency === 'one-time'
                ? 'Today or earlier deducts this amount from your available balance immediately.'
                : form.frequency === 'monthly'
                  ? 'Used for payment reminders (1 week & 1 day before)'
                  : 'Optional'
            }
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
