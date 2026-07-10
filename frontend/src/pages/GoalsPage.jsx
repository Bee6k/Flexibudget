import { useState, useEffect } from 'react';
import {
  Box, Button, Grid, Typography, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, Stack, MenuItem, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/ui/PageHeader';
import ProgressTargetCard from '../components/ui/ProgressTargetCard';
import EmptyState from '../components/ui/EmptyState';
import * as goalsApi from '../services/goals';
import { GOALS_KEY } from '../utils/authSession';

const PRESETS = ['Emergency Fund', 'Car', 'House', 'Vacation', 'Education', 'Custom Goal'];

function loadLocalGoals() {
  try { return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]'); } catch { return []; }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: 'Emergency Fund', target: '', current: '' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        let items = await goalsApi.listGoals();
        const local = loadLocalGoals();
        if (items.length === 0 && local.length > 0) {
          for (const goal of local) {
            await goalsApi.createGoal({
              name: goal.name,
              target: goal.target,
              current: goal.current ?? 0,
            });
          }
          localStorage.removeItem(GOALS_KEY);
          items = await goalsApi.listGoals();
        }
        if (!cancelled) setGoals(items);
      } catch {
        if (!cancelled) setError('Could not load goals.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function addGoal() {
    const target = Number(form.target);
    const current = Number(form.current) || 0;
    if (!form.name.trim()) {
      setFormError('Choose a goal type.');
      return;
    }
    if (!form.target || Number.isNaN(target) || target <= 0) {
      setFormError('Enter a target amount greater than zero.');
      return;
    }
    setFormError('');
    try {
      const created = await goalsApi.createGoal({ name: form.name, target, current });
      setGoals((g) => [...g, created]);
      setOpen(false);
      setForm({ name: 'Emergency Fund', target: '', current: '' });
    } catch {
      setError('Could not create goal.');
    }
  }

  async function removeGoal(id) {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalsApi.deleteGoal(id);
      setGoals((g) => g.filter((item) => item.id !== id));
    } catch {
      setError('Could not delete goal.');
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
        title="Savings Targets"
        subtitle="Active milestones across your portfolio. Monitor how close you are to each savings goal."
        action={(
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormError(''); setOpen(true); }}>
            New goal
          </Button>
        )}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {goals.length === 0 ? (
        <EmptyState
          title="No savings targets yet"
          description="Create your first goal to track progress toward emergency funds, education, or other milestones."
          action={(
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormError(''); setOpen(true); }}>
              Create goal
            </Button>
          )}
        />
      ) : (
        <Grid container spacing={2.5}>
          {goals.map((g) => (
            <Grid item xs={12} md={6} lg={4} key={g.id}>
              <ProgressTargetCard
                label={g.name}
                target={g.target}
                current={g.current}
                onDelete={() => removeGoal(g.id)}
                deleteAriaLabel={`Delete ${g.name}`}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create goal</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Goal type" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}>
              {PRESETS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField type="number" label="Target amount" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} />
            <TextField type="number" label="Current saved" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addGoal}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
