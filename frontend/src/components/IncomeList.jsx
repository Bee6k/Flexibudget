import { Paper, Typography, List, ListItem, ListItemText, IconButton, Stack, Chip, Box, Button, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';
import EmptyState from './ui/EmptyState';

export default function IncomeList({ incomes, onEdit, onDelete, onAdd }) {
  const sorted = [...(incomes || [])].sort(
    (a, b) => new Date(a.expected_date) - new Date(b.expected_date),
  );

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" gutterBottom>Upcoming income</Typography>
      {sorted.length === 0 ? (
        <EmptyState
          compact
          title="No income scheduled"
          description="Add salary, freelance payments, or one-time inflows to improve your balance forecast."
          action={onAdd ? (
            <Chip label="Add income" variant="outlined" onClick={onAdd} clickable />
          ) : null}
        />
      ) : (
        <List dense disablePadding>
          {sorted.map((i) => (
            <ListItem
              key={i.income_id ?? i.source_name + i.expected_date}
              divider
              secondaryAction={(
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(i)} aria-label={`Edit ${i.source_name}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onDelete(i)}
                    sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0 }}
                  >
                    Remove
                  </Button>
                </Stack>
              )}
              sx={{ pr: { xs: 14, sm: 16 } }}
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
