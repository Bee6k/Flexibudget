import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/**
 * Consistent empty-state pattern across lists, charts, and tables.
 */
export default function EmptyState({
  icon: Icon = InboxOutlinedIcon,
  title = 'Nothing here yet',
  description,
  action,
  compact = false,
}) {
  return (
    <Box
      sx={{
        py: compact ? 3 : 5,
        px: 3,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Icon sx={{ fontSize: compact ? 36 : 44, color: 'text.secondary', mb: 1.5, opacity: 0.7 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: action ? 2.5 : 0, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
