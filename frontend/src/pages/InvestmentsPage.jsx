import { useState, useEffect } from 'react';

import {

  Box, Grid, Paper, Typography, Stack, Chip, Button, Dialog, DialogTitle,

  DialogContent, TextField, DialogActions, MenuItem, IconButton, CircularProgress, Alert,

} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';

import PageHeader from '../components/ui/PageHeader';

import MoneyText from '../components/ui/MoneyText';

import { DonutAllocationChart } from '../components/charts/FinanceCharts';

import { CHART_PALETTE } from '../theme/financialColors';

import { INVESTMENTS_KEY } from '../utils/localData';

import * as investmentsApi from '../services/investments';



const TYPES = ['Mutual Funds', 'Stocks', 'Crypto', 'FDs', 'Gold', 'Real Estate', 'Other'];

const DEMO_NAMES = new Set(['Nabil Equity Fund', 'BTC Holdings', 'Fixed Deposit']);

const EMPTY_FORM = { name: '', type: 'Mutual Funds', value: '', change: '' };



export default function InvestmentsPage() {

  const [holdings, setHoldings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);

  const [formError, setFormError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);

      setError('');

      try {

        let items = await investmentsApi.listInvestments();

        let local = [];

        try { local = JSON.parse(localStorage.getItem(INVESTMENTS_KEY) || '[]'); } catch { local = []; }

        local = local.filter((h) => !DEMO_NAMES.has(h.name));

        if (items.length === 0 && local.length > 0) {

          for (const holding of local) {

            await investmentsApi.createInvestment({

              name: holding.name,

              type: holding.type || 'Other',

              value: holding.value,

              change: holding.change ?? 0,

            });

          }

          localStorage.removeItem(INVESTMENTS_KEY);

          items = await investmentsApi.listInvestments();

        }

        if (!cancelled) setHoldings(items);

      } catch {

        if (!cancelled) setError('Could not load investments.');

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    load();

    return () => { cancelled = true; };

  }, []);



  async function addHolding() {

    const value = Number(form.value);

    if (!form.name.trim() || Number.isNaN(value) || value <= 0) {

      setFormError('Enter a name and a value greater than zero.');

      return;

    }

    setFormError('');

    try {

      const created = await investmentsApi.createInvestment({

        name: form.name.trim(),

        type: form.type,

        value,

        change: Number(form.change) || 0,

      });

      setHoldings((h) => [...h, created]);

      setForm(EMPTY_FORM);

      setOpen(false);

    } catch {

      setError('Could not add investment.');

    }

  }



  async function removeHolding(id) {

    try {

      await investmentsApi.deleteInvestment(id);

      setHoldings((h) => h.filter((x) => x.id !== id));

    } catch {

      setError('Could not remove investment.');

    }

  }



  const total = holdings.reduce((s, h) => s + h.value, 0);

  const chartTiers = holdings.map((h) => ({ name: h.type, total_cost: h.value }));



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

        title="Investments"

        subtitle="Track holdings you add yourself — nothing is pre-filled."

        action={

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>

            Add holding

          </Button>

        }

      />



      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}



      {holdings.length === 0 ? (

        <Paper sx={{ p: 4, textAlign: 'center' }}>

          <ShowChartOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />

          <Typography variant="h6" fontWeight={700} gutterBottom>No investments yet</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 420, mx: 'auto' }}>

            Add mutual funds, fixed deposits, crypto, or other assets to see your portfolio here.

          </Typography>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>

            Add your first holding

          </Button>

        </Paper>

      ) : (

        <Grid container spacing={2.5}>

          <Grid item xs={12} lg={4}>

            <Paper sx={{ p: 3, height: '100%', minWidth: 0 }}>

              <Typography variant="overline" color="text.secondary">Total portfolio value</Typography>

              <MoneyText value={total} variant="h3" sx={{ mt: 1 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>

                {holdings.length} holding{holdings.length === 1 ? '' : 's'}

              </Typography>

            </Paper>

          </Grid>

          <Grid item xs={12} lg={8}>

            <Paper sx={{ p: 3, height: '100%' }}>

              <Typography variant="h6" fontWeight={700} gutterBottom>Asset mix</Typography>

              <DonutAllocationChart tiers={chartTiers} />

            </Paper>

          </Grid>

          {holdings.map((h, i) => (

            <Grid item xs={12} sm={6} lg={4} key={h.id}>

              <Paper

                sx={{

                  p: 2.5,

                  minWidth: 0,

                  borderTop: `3px solid ${CHART_PALETTE[i % CHART_PALETTE.length]}`,

                }}

              >

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">

                  <Box sx={{ minWidth: 0, flex: 1 }}>

                    <Typography variant="subtitle1" fontWeight={700} title={h.name}>{h.name}</Typography>

                    <Chip size="small" label={h.type} variant="outlined" sx={{ mt: 1 }} />

                  </Box>

                  <Stack direction="row" alignItems="center" spacing={0.5}>

                    <Typography variant="body2" fontWeight={700} color={h.change >= 0 ? 'success.main' : 'error.main'}>

                      {h.change >= 0 ? '+' : ''}{h.change}%

                    </Typography>

                    <IconButton size="small" onClick={() => removeHolding(h.id)} aria-label="Remove">

                      <DeleteOutlineIcon fontSize="small" />

                    </IconButton>

                  </Stack>

                </Stack>

                <MoneyText value={h.value} variant="h5" sx={{ mt: 1.5, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }} />

              </Paper>

            </Grid>

          ))}

        </Grid>

      )}



      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>

        <DialogTitle>Add investment</DialogTitle>

        <DialogContent>

          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Stack spacing={2} sx={{ mt: 1 }}>

            <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />

            <TextField select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>

              {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}

            </TextField>

            <TextField type="number" label="Current value (NPR)" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} inputProps={{ min: 0, step: '0.01' }} />

            <TextField type="number" label="Change % (optional)" value={form.change} onChange={(e) => setForm((f) => ({ ...f, change: e.target.value }))} />

          </Stack>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={addHolding}>Save</Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}

