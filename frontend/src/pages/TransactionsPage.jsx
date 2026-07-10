import { useMemo, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Stack, Chip, IconButton, Typography, MenuItem, Button, Checkbox, Alert,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { expensesToTransactions, incomesToTransactions } from '../utils/financeMetrics';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';
import { deleteExpense } from '../services/expenses';
import { deleteIncome } from '../services/incomes';

function escapeCsvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export default function TransactionsPage() {
  const finance = useFinanceView();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    const all = [
      ...expensesToTransactions(finance?.view?.expenses),
      ...incomesToTransactions(finance?.view?.incomes),
    ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

    return all.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [finance?.view, search, typeFilter]);

  if (!finance) return <FinanceUnavailable />;

  const { refresh } = finance;

  function exportCsv() {
    const header = ['Date', 'Name', 'Type', 'Category', 'Amount'].map(escapeCsvCell).join(',');
    const body = rows
      .map((r) => [r.date, r.name, r.type, r.category, r.amount].map(escapeCsvCell).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flexibudget-transactions.csv';
    a.click();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError('');
    try {
      if (pendingDelete.mode === 'bulk') {
        for (const id of pendingDelete.ids) {
          if (id.startsWith('exp-')) await deleteExpense(Number(id.replace('exp-', '')));
          if (id.startsWith('inc-')) await deleteIncome(Number(id.replace('inc-', '')));
        }
        setSelected(new Set());
      } else if (pendingDelete.row) {
        const r = pendingDelete.row;
        if (r.type === 'expense') await deleteExpense(r.raw.expense_id);
        else await deleteIncome(r.raw.income_id);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(r.id);
          return next;
        });
      }
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id)) && !allSelected;

  return (
    <Box>
      <PageHeader
        title="Transactions"
        subtitle="Unified ledger of income and expense events."
        action={(
          <Stack direction="row" spacing={1}>
            <Button startIcon={<FileDownloadOutlinedIcon />} variant="outlined" onClick={exportCsv}>Export CSV</Button>
            {selected.size > 0 && (
              <Button
                color="error"
                variant="contained"
                onClick={() => setPendingDelete({ mode: 'bulk', ids: [...selected], count: selected.size })}
              >
                Delete ({selected.size})
              </Button>
            )}
          </Stack>
        )}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField placeholder="Search transactions…" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          <TextField select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(rows.map((r) => r.id)));
                    else setSelected(new Set());
                  }}
                  inputProps={{ 'aria-label': 'Select all transactions' }}
                />
              </TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions yet. Add income or expenses to see them here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover selected={selected.has(r.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selected.has(r.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(r.id);
                      else next.delete(r.id);
                      setSelected(next);
                    }}
                    inputProps={{ 'aria-label': `Select ${r.name}` }}
                  />
                </TableCell>
                <TableCell>{formatShortDate(r.date)}</TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{r.name}</Typography></TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{r.category}</Typography></TableCell>
                <TableCell>
                  <Chip size="small" label={r.type} color={r.type === 'income' ? 'success' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: r.amount >= 0 ? 'success.main' : 'error.main' }}>
                  {formatCurrency(Math.abs(r.amount))}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={`Delete ${r.name}`}
                    onClick={() => setPendingDelete({ mode: 'single', row: r })}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.mode === 'bulk' ? 'Delete selected transactions?' : 'Delete transaction?'}
        message={
          pendingDelete?.mode === 'bulk'
            ? `${pendingDelete.count} selected item(s) will be permanently removed.`
            : `“${pendingDelete?.row?.name}” will be permanently removed.`
        }
        confirmLabel="Delete"
        loading={deleting}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
