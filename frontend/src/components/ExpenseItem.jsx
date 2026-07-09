import { ListItem, ListItemText, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { formatCurrency } from '../utils/currency';

export default function ExpenseItem({ expense, onEdit, onDelete }) {
  return (
    <ListItem
      divider
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit(expense)} aria-label="edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(expense)} aria-label="delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <ListItemText
        primary={expense.name}
        secondary={`${formatCurrency(expense.amount)} · ${expense.frequency}`}
      />
    </ListItem>
  );
}
