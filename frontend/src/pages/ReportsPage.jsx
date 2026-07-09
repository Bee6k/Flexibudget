import { Box, Grid, Paper, Typography, Button, Stack, List, ListItem, ListItemText } from '@mui/material';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import PageHeader from '../components/ui/PageHeader';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { formatCurrency } from '../utils/currency';

export default function ReportsPage() {
  const finance = useFinanceView();
  if (!finance) return <FinanceUnavailable />;
  const { view } = finance;

  const report = {
    balance: view.current_balance,
    burn: (view.horizon?.daily_burn_rate || 0) * 30,
    runway: view.horizon?.days_remaining,
    crisis: view.crisis?.state,
    tiers: view.allocation?.tiers || [],
  };

  function downloadJson() {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flexibudget-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function downloadCsv() {
    const rows = [
      ['Field', 'Value'],
      ['Balance', report.balance],
      ['Monthly burn', report.burn],
      ['Runway (days)', report.runway ?? '365+'],
      ['Crisis state', report.crisis],
      ...report.tiers.map((t) => [`Tier ${t.tier} ${t.name}`, `${t.status} (${Math.round(t.coverage_percentage)}%)`]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flexibudget-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <Box>
      <PageHeader title="Reports Center" subtitle="Export financial snapshots for review or submission." />
      <Grid container spacing={2.5}>
        {['Monthly', 'Quarterly', 'Annual'].map((period) => (
          <Grid item xs={12} md={4} key={period}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700}>{period} snapshot</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current balance, allocation, and runway summary.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<DataObjectOutlinedIcon />} variant="outlined" onClick={downloadJson}>Export JSON</Button>
                <Button size="small" startIcon={<TableChartOutlinedIcon />} variant="outlined" onClick={downloadCsv}>Export CSV</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Current period snapshot</Typography>
            <List dense>
              <ListItem><ListItemText primary="Balance" secondary={formatCurrency(report.balance)} /></ListItem>
              <ListItem><ListItemText primary="Monthly burn" secondary={formatCurrency(report.burn)} /></ListItem>
              <ListItem><ListItemText primary="Runway" secondary={report.runway ?? '365+ days'} /></ListItem>
              <ListItem><ListItemText primary="Crisis state" secondary={report.crisis} /></ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
