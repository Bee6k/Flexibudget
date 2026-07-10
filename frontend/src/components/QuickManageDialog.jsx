import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem,
  ListItemText, IconButton, Typography, Tabs, Tab, Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { deleteExpense } from '../services/expenses';
import { deleteIncome } from '../services/incomes';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';
import { priorityLabel } from '../utils/copy';

/**
 * Global manage dialog — remove expenses/income from anywhere (mirrors Quick add).
 */
export default function QuickManageDialog({ open, initialTab = 'expenses', onClose }) {
  const { view, refresh } = useFinance();
  const { showToast } = useToast();
  const [tab, setTab] = useState(initialTab === 'income' ? 1 : 0);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setTab(initialTab === 'income' ? 1 : 0);
  }, [open, initialTab]);

  const expenses = useMemo(
    () => [...(view?.expenses || [])].sort((a, b) => Number(b.amount) - Number(a.amount)),
    [view?.expenses],
  );
  const incomes = useMemo(
    () => [...(view?.incomes || [])].sort(
      (a, b) => String(a.expected_date || '').localeCompare(String(b.expected_date || '')),
    ),
    [view?.incomes],
  );

  async function confirmRemove() {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === 'expense') {
        await deleteExpense(pending.item.expense_id);
        showToast(`Removed “${pending.item.name}”.`);
      } else {
        await deleteIncome(pending.item.income_id);
        showToast(`Removed “${pending.item.source_name}”.`);
      }
      await refresh();
      setPending(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not remove item.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Manage money</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Remove items you no longer need — same as Expense / Income Manager, without leaving this page.
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 1, minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab label={`Expenses (${expenses.length})`} />
            <Tab label={`Income (${incomes.length})`} />
          </Tabs>
          <Divider sx={{ mb: 1 }} />

          {tab === 0 && (
            expenses.length === 0 ? (
              <EmptyState
                compact
                title="No expenses"
                description="Nothing to remove yet. Add an expense from Quick add when you are ready."
              />
            ) : (
              <List dense disablePadding sx={{ maxHeight: 360, overflow: 'auto' }}>
                {expenses.map((e) => (
                  <ListItem
                    key={e.expense_id}
                    divider
                    secondaryAction={(
                      <IconButton
                        edge="end"
                        color="error"
                        aria-label={`Remove ${e.name}`}
                        onClick={() => setPending({ kind: 'expense', item: e })}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                    sx={{ pr: 7 }}
                  >
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600}>{e.name}</Typography>}
                      secondary={`${formatCurrency(e.amount)} · ${priorityLabel(e.priority_tier)}${e.due_date ? ` · due ${formatShortDate(e.due_date)}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            )
          )}

          {tab === 1 && (
            incomes.length === 0 ? (
              <EmptyState
                compact
                title="No income"
                description="Nothing to remove yet. Add income from Quick add when you are ready."
              />
            ) : (
              <List dense disablePadding sx={{ maxHeight: 360, overflow: 'auto' }}>
                {incomes.map((i) => (
                  <ListItem
                    key={i.income_id}
                    divider
                    secondaryAction={(
                      <IconButton
                        edge="end"
                        color="error"
                        aria-label={`Remove ${i.source_name}`}
                        onClick={() => setPending({ kind: 'income', item: i })}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                    sx={{ pr: 7 }}
                  >
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600}>{i.source_name}</Typography>}
                      secondary={`${formatCurrency(i.amount)}${i.expected_date ? ` · ${formatShortDate(i.expected_date)}` : ''}${i.is_recurring ? ' · Recurring' : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            component={RouterLink}
            to={tab === 0 ? '/expenses' : '/income'}
            onClick={onClose}
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ textTransform: 'none' }}
          >
            Open full {tab === 0 ? 'Expense' : 'Income'} Manager
          </Button>
          <Button onClick={onClose} variant="outlined">Done</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.kind === 'expense' ? 'Remove expense?' : 'Remove income?'}
        message={
          pending?.kind === 'expense'
            ? `“${pending?.item?.name}” will be removed from your budget. Runway and allocation will update.`
            : `“${pending?.item?.source_name}” will be removed from your schedule. Forecasts will update.`
        }
        confirmLabel="Remove"
        loading={busy}
        onClose={() => !busy && setPending(null)}
        onConfirm={confirmRemove}
      />
    </>
  );
}
