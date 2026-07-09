import { useState, useEffect } from 'react';

import {

  Box, Grid, Paper, Typography, Button, Stack, Chip, Dialog, DialogTitle,

  DialogContent, TextField, DialogActions, Alert, IconButton, MenuItem, CircularProgress,

} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import PageHeader from '../components/ui/PageHeader';

import { formatCurrency } from '../utils/currency';

import { SUBSCRIPTIONS_KEY } from '../utils/localData';

import { formatDueLabel, nextDueDate } from '../utils/dueDates';

import * as subscriptionsApi from '../services/subscriptions';



export default function SubscriptionsPage() {

  const [subs, setSubs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);

  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({ name: '', amount: '', due_day: '1' });



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);

      setError('');

      try {

        let items = await subscriptionsApi.listSubscriptions();

        let local = [];

        try { local = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '[]'); } catch { local = []; }

        if (items.length === 0 && local.length > 0) {

          for (const sub of local) {

            await subscriptionsApi.createSubscription({

              name: sub.name,

              amount: sub.amount,

              due_day: sub.due_day ?? 1,

            });

          }

          localStorage.removeItem(SUBSCRIPTIONS_KEY);

          items = await subscriptionsApi.listSubscriptions();

        }

        if (!cancelled) setSubs(items);

      } catch {

        if (!cancelled) setError('Could not load subscriptions.');

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    load();

    return () => { cancelled = true; };

  }, []);



  const monthlyTotal = subs.filter((s) => s.active !== false).reduce((s, x) => s + Number(x.amount || 0), 0);



  async function addSub() {

    const amount = Number(form.amount);

    const due_day = Math.min(28, Math.max(1, Number(form.due_day) || 1));

    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0) {

      setFormError('Enter a name and a monthly cost greater than zero.');

      return;

    }

    setFormError('');

    try {

      const created = await subscriptionsApi.createSubscription({

        name: form.name.trim(),

        amount,

        due_day,

      });

      setSubs((x) => [...x, created]);

      setForm({ name: '', amount: '', due_day: '1' });

      setOpen(false);

      window.dispatchEvent(new Event('flexibudget-storage'));

    } catch {

      setError('Could not add subscription.');

    }

  }



  async function removeSub(id) {

    try {

      await subscriptionsApi.deleteSubscription(id);

      setSubs((x) => x.filter((i) => i.id !== id));

      window.dispatchEvent(new Event('flexibudget-storage'));

    } catch {

      setError('Could not remove subscription.');

    }

  }



  if (loading) {

    return (

      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>

        <CircularProgress />

      </Box>

    );

  }



  return (

    <Box>

      <PageHeader

        title="Subscriptions"

        subtitle="Track recurring charges. We remind you 1 week and 1 day before each billing date."

        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add subscription</Button>}

      />



      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}



      <Alert severity="info" sx={{ mb: 2 }}>

        Set a billing day for each subscription to receive payment reminders in the bell icon above.

      </Alert>



      <Grid container spacing={2.5} sx={{ mb: 2 }}>

        <Grid item xs={12} md={4}>

          <Paper sx={{ p: 2.5 }}>

            <Typography variant="overline" color="text.secondary">Monthly total</Typography>

            <Typography variant="h4" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{formatCurrency(monthlyTotal)}</Typography>

          </Paper>

        </Grid>

      </Grid>



      {subs.length === 0 ? (

        <Paper sx={{ p: 4, textAlign: 'center' }}>

          <Typography variant="body2" color="text.secondary">No subscriptions added yet.</Typography>

        </Paper>

      ) : (

        <Grid container spacing={2}>

          {subs.map((s) => {

            const next = nextDueDate({ dueDay: s.due_day ?? 1, frequency: 'monthly' });

            return (

              <Grid item xs={12} md={4} key={s.id}>

                <Paper sx={{ p: 2.5, opacity: s.active === false ? 0.6 : 1 }}>

                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">

                    <Box>

                      <Typography fontWeight={700}>{s.name}</Typography>

                      <Typography variant="body2" color="text.secondary">{formatCurrency(s.amount)}/month</Typography>

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>

                        Bills on day {s.due_day ?? 1}

                        {next ? ` · Next ${formatDueLabel(next)}` : ''}

                      </Typography>

                    </Box>

                    <IconButton size="small" onClick={() => removeSub(s.id)}>

                      <DeleteOutlineIcon fontSize="small" />

                    </IconButton>

                  </Stack>

                  {s.active === false && <Chip size="small" label="Paused" color="warning" sx={{ mt: 1 }} />}

                </Paper>

              </Grid>

            );

          })}

        </Grid>

      )}



      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>

        <DialogTitle>Add subscription</DialogTitle>

        <DialogContent>

          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Stack spacing={2} sx={{ mt: 1 }}>

            <TextField label="Name" placeholder="Netflix, Spotify…" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />

            <TextField type="number" label="Monthly cost (NPR)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} inputProps={{ min: 0, step: '0.01' }} />

            <TextField

              select

              label="Billing day of month"

              value={form.due_day}

              onChange={(e) => setForm((f) => ({ ...f, due_day: e.target.value }))}

              helperText="Used for payment reminders"

            >

              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (

                <MenuItem key={d} value={String(d)}>{d}</MenuItem>

              ))}

            </TextField>

          </Stack>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={addSub}>Save</Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}

