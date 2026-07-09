import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, FormControlLabel, Switch, Alert,
} from '@mui/material';
import { toInputDate } from '../utils/dates';

const EMPTY = { source_name: '', amount: '', expected_date: '', is_recurring: false };

export default function IncomeForm({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        source_name: initial.source_name || '',
        amount: initial.amount ?? '',
        expected_date: toInputDate(initial.expected_date),
        is_recurring: Boolean(initial.is_recurring),
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
    if (!form.source_name.trim()) { setError('Source name is required.'); return; }
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) { setError('Amount must be greater than zero.'); return; }
    if (!form.expected_date) { setError('Expected date is required.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        source_name: form.source_name.trim(),
        amount,
        expected_date: form.expected_date,
        is_recurring: form.is_recurring,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save income.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? 'Edit income' : 'Add income'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Source name" required value={form.source_name} onChange={update('source_name')} autoFocus />
          <TextField
            label="Amount" type="number" required value={form.amount} onChange={update('amount')}
            inputProps={{ min: 0, step: '0.01' }}
          />
          <TextField
            label="Expected date" type="date" required
            value={form.expected_date} onChange={update('expected_date')}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_recurring}
                onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))}
              />
            }
            label="Recurring"
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
