import { useMemo } from 'react';
import {
  Paper, Typography, List, Accordion, AccordionSummary, AccordionDetails, Box, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpenseItem from './ExpenseItem';
import EmptyState from './ui/EmptyState';
import { priorityLabel } from '../utils/copy';

export default function ExpenseList({ expenses, onEdit, onDelete, onAdd }) {
  const grouped = useMemo(() => {
    const g = { 1: [], 2: [], 3: [], 4: [] };
    for (const e of expenses || []) g[e.priority_tier]?.push(e);
    return g;
  }, [expenses]);

  const total = (expenses || []).length;

  if (total === 0) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6" gutterBottom>Expenses</Typography>
        <EmptyState
          compact
          title="No expenses yet"
          description="Add rent, food, subscriptions, and other bills to unlock allocation and runway forecasts."
          action={onAdd ? (
            <Chip label="Use Add expense above" variant="outlined" onClick={onAdd} clickable />
          ) : null}
        />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" gutterBottom>Expenses</Typography>
      {[1, 2, 3, 4].map((tier) => (
        <Accordion key={tier} defaultExpanded={tier <= 2} disableGutters sx={{ '&:before': { display: 'none' }, mb: 0.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }} fontWeight={500}>
                {priorityLabel(tier)}
              </Typography>
              <Chip size="small" label={`${grouped[tier].length} item${grouped[tier].length === 1 ? '' : 's'}`} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {grouped[tier].length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
                No expenses in this tier.
              </Typography>
            ) : (
              <List dense disablePadding>
                {grouped[tier].map((e) => (
                  <ExpenseItem
                    key={e.expense_id ?? `${tier}-${e.name}`}
                    expense={e}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
}
