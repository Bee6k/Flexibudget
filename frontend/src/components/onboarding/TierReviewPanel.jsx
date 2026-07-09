import { useState } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, IconButton, Grid, alpha, Tooltip,
  TextField, Button, Collapse,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { formatCurrency } from '../../utils/currency';
import { amountPresets, COMMON_DUE_DAYS, nudgeAmount } from '../../utils/onboardingAmounts';

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 15000, 25000];

export default function TierReviewPanel({
  tier,
  items,
  onAmountChange,
  onDueDayChange,
  onFrequencyChange,
  onNameChange,
  onDueDateChange,
  onRemove,
  onAdd,
  isLifestyle = false,
  defaultShowAddForm = false,
}) {
  const [showAddForm, setShowAddForm] = useState(defaultShowAddForm);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('5000');
  const [newFrequency, setNewFrequency] = useState('monthly');

  function resetAddForm() {
    setNewName('');
    setNewAmount('5000');
    setNewFrequency('monthly');
  }

  function handleSaveNew() {
    const trimmed = newName.trim();
    const amount = Number(newAmount);
    if (!trimmed || Number.isNaN(amount) || amount <= 0) return;
    onAdd({ name: trimmed, amount, frequency: newFrequency });
    resetAddForm();
    setShowAddForm(false);
  }

  return (
    <Stack spacing={2}>
      {items.length === 0 && !showAddForm && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 1 }}>
          No items yet — tap below to add one.
        </Typography>
      )}

      {items.map((item, index) => {
        const freq = item.frequency || 'monthly';
        const base = Number(item.baseAmount || item.amount) || 1000;
        const presets = amountPresets(base);
        const activePreset = presets.find((p) => p.amount === Number(item.amount))?.key || null;

        return (
          <Paper
            key={item.localId}
            className="animate-stagger-item"
            sx={{
              p: 2.25,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (t) => isLifestyle
                ? `linear-gradient(135deg, ${alpha(tier.color, t.palette.mode === 'dark' ? 0.14 : 0.08)} 0%, ${alpha(t.palette.background.paper, 1)} 55%)`
                : alpha(tier.color, t.palette.mode === 'dark' ? 0.06 : 0.03),
              animationDelay: `${index * 0.07}s`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: tier.color,
                borderRadius: '4px 0 0 4px',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Name"
                  value={item.name}
                  onChange={(e) => onNameChange(item.localId, e.target.value)}
                  InputProps={{ sx: { fontWeight: 700 } }}
                />
              </Box>
              <IconButton size="small" onClick={() => onRemove(item.localId)} aria-label="Remove">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>
              Payment frequency
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  clickable
                  size="small"
                  color={freq === opt.value ? 'primary' : 'default'}
                  variant={freq === opt.value ? 'filled' : 'outlined'}
                  onClick={() => onFrequencyChange(item.localId, opt.value)}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              {freq === 'yearly' ? 'How much per year?' : 'How much per month?'}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
              {presets.map((p) => (
                <Chip
                  key={p.key}
                  label={`${p.label} · ${formatCurrency(p.amount)}`}
                  clickable
                  onClick={() => onAmountChange(item.localId, String(p.amount))}
                  color={activePreset === p.key ? 'primary' : 'default'}
                  variant={activePreset === p.key ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <IconButton
                size="small"
                onClick={() => onAmountChange(item.localId, String(nudgeAmount(item.amount, -500)))}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                type="number"
                label={freq === 'yearly' ? 'Yearly NPR' : 'Monthly NPR'}
                value={item.amount}
                onChange={(e) => onAmountChange(item.localId, e.target.value)}
                sx={{ width: 140 }}
                inputProps={{ min: 1, step: '0.01' }}
              />
              <IconButton
                size="small"
                onClick={() => onAmountChange(item.localId, String(nudgeAmount(item.amount, 500)))}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            {freq === 'monthly' ? (
              <>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                  <EventOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Due day each month
                  </Typography>
                </Stack>
                <Grid container spacing={0.75}>
                  {COMMON_DUE_DAYS.map((d) => {
                    const active = String(item.due_day || '1') === String(d);
                    return (
                      <Grid item key={d}>
                        <Tooltip title={`Day ${d} of each month`}>
                          <Chip
                            label={d}
                            size="small"
                            clickable
                            onClick={() => onDueDayChange(item.localId, String(d))}
                            color={active ? 'primary' : 'default'}
                            variant={active ? 'filled' : 'outlined'}
                            sx={{ minWidth: 36, fontWeight: 700 }}
                          />
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            ) : (
              <TextField
                size="small"
                type="date"
                label="Annual due date"
                value={item.due_date || ''}
                onChange={(e) => onDueDateChange(item.localId, e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                helperText="When this yearly payment is due"
              />
            )}
          </Paper>
        );
      })}

      <Collapse in={showAddForm}>
        <Paper
          sx={{
            p: 2.25,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: tier.color,
            bgcolor: (t) => alpha(tier.color, t.palette.mode === 'dark' ? 0.08 : 0.04),
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: tier.color }}>
            New item for {tier.label}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Item name"
              placeholder="e.g. Gym, Netflix, Insurance"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              autoFocus
            />

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                Payment frequency
              </Typography>
              <Stack direction="row" spacing={1}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    clickable
                    color={newFrequency === opt.value ? 'primary' : 'default'}
                    variant={newFrequency === opt.value ? 'filled' : 'outlined'}
                    onClick={() => setNewFrequency(opt.value)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                Amount ({newFrequency === 'monthly' ? 'per month' : 'per year'})
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1 }}>
                {QUICK_AMOUNTS.map((v) => (
                  <Chip
                    key={v}
                    label={formatCurrency(v)}
                    size="small"
                    clickable
                    color={String(newAmount) === String(v) ? 'primary' : 'default'}
                    variant={String(newAmount) === String(v) ? 'filled' : 'outlined'}
                    onClick={() => setNewAmount(String(v))}
                  />
                ))}
              </Stack>
              <TextField
                type="number"
                label="Custom amount (NPR)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                fullWidth
                inputProps={{ min: 1, step: '0.01' }}
              />
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                onClick={() => { resetAddForm(); setShowAddForm(false); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={handleSaveNew}
                disabled={!newName.trim() || Number(newAmount) <= 0}
              >
                Save item
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      {!showAddForm && (
        <Button
          type="button"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          sx={{
            borderStyle: 'dashed',
            py: 1.25,
            borderColor: tier.color,
            color: tier.color,
            '&:hover': { borderStyle: 'dashed', bgcolor: alpha(tier.color, 0.06) },
          }}
        >
          Add another item
        </Button>
      )}
    </Stack>
  );
}
