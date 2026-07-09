import { Paper, Typography, List, ListItem, ListItemText, IconButton, Stack, Chip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

export default function IncomeList({ incomes, onEdit, onDelete }) {
  const sorted = [...(incomes || [])].sort(
    (a, b) => new Date(a.expected_date) - new Date(b.expected_date),
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Upcoming income</Typography>
      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No income scheduled.</Typography>
      ) : (
        <List dense disablePadding>
          {sorted.map((i) => (
            <ListItem
              key={i.income_id ?? i.source_name + i.expected_date}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onEdit(i)} aria-label="edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(i)} aria-label="delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={(
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <span>{i.source_name}</span>
                    {i.is_recurring && <Chip label="recurring" size="small" />}
                  </Box>
                )}
                secondary={`${formatCurrency(i.amount)} · ${formatDate(i.expected_date)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
