import { useMemo, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Stack, Chip, IconButton, Typography, MenuItem, Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PageHeader from '../components/ui/PageHeader';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { expensesToTransactions, incomesToTransactions } from '../utils/financeMetrics';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';
import { deleteExpense } from '../services/expenses';
import { deleteIncome } from '../services/incomes';

export default function TransactionsPage() {
  const finance = useFinanceView();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());

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
    const header = 'Date,Name,Type,Category,Amount\n';
    const body = rows.map((r) => `${r.date},${r.name},${r.type},${r.category},${r.amount}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flexibudget-transactions.csv';
    a.click();
  }

  async function removeSelected() {
    for (const id of selected) {
      if (id.startsWith('exp-')) await deleteExpense(Number(id.replace('exp-', '')));
      if (id.startsWith('inc-')) await deleteIncome(Number(id.replace('inc-', '')));
    }
    setSelected(new Set());
    await refresh();
  }

  return (
    <Box>
      <PageHeader
        title="Transactions"
        subtitle="Unified ledger of income and expense events."
        action={(
          <Stack direction="row" spacing={1}>
            <Button startIcon={<FileDownloadOutlinedIcon />} variant="outlined" onClick={exportCsv}>Export CSV</Button>
            {selected.size > 0 && (
              <Button color="error" variant="contained" onClick={removeSelected}>Delete ({selected.size})</Button>
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

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover selected={selected.has(r.id)}>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(r.id);
                      else next.delete(r.id);
                      setSelected(next);
                    }}
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
                    onClick={async () => {
                      if (r.type === 'expense') await deleteExpense(r.raw.expense_id);
                      else await deleteIncome(r.raw.income_id);
                      await refresh();
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
