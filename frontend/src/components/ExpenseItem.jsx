import { ListItem, ListItemText, IconButton, Stack, Button, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatCurrency } from '../utils/currency';

export default function ExpenseItem({ expense, onEdit, onDelete }) {
  return (
    <ListItem
      divider
      secondaryAction={(
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(expense)} aria-label={`Edit ${expense.name}`}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => onDelete(expense)}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0 }}
          >
            Remove
          </Button>
        </Stack>
      )}
      sx={{ pr: { xs: 14, sm: 16 } }}
    >
      <ListItemText
        primary={expense.name}
        secondary={`${formatCurrency(expense.amount)} · ${expense.frequency}`}
      />
    </ListItem>
  );
}
