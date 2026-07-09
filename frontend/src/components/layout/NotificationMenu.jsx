import {
  Box, Menu, Typography, MenuItem, Divider, Button, Stack, Chip, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import SubscriptionsOutlinedIcon from '@mui/icons-material/SubscriptionsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/currency';

const ICON = {
  payment: EventOutlinedIcon,
  subscription: SubscriptionsOutlinedIcon,
  system: InfoOutlinedIcon,
};

export default function NotificationMenu({ anchor, onClose }) {
  const { notifications, dismiss, dismissAll } = useNotifications();
  const navigate = useNavigate();
  const open = Boolean(anchor);

  return (
    <Menu
      anchorEl={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 360, maxWidth: '95vw', maxHeight: 420 } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700}>Reminders</Typography>
        {notifications.length > 0 && (
          <Button size="small" onClick={() => { dismissAll(); }}>Clear all</Button>
        )}
      </Box>
      <Divider />

      {notifications.length === 0 ? (
        <Box sx={{ px: 2, py: 3 }}>
          <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
            No upcoming reminders. Add due dates to monthly bills or set a billing day on subscriptions.
          </Typography>
        </Box>
      ) : (
        notifications.map((n) => {
          const Icon = ICON[n.type] || InfoOutlinedIcon;
          return (
            <MenuItem
              key={n.id}
              sx={{ alignItems: 'flex-start', py: 1.5, whiteSpace: 'normal' }}
              onClick={() => {
                if (n.type === 'subscription') navigate('/subscriptions');
                else if (n.type === 'payment') navigate('/expenses');
                else navigate('/dashboard');
                onClose();
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                <Box
                  sx={{
                    mt: 0.25,
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: n.severity === 'error' ? 'error.main' : n.severity === 'warning' ? 'warning.main' : 'primary.main',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={700}>{n.title}</Typography>
                    {n.amount > 0 && (
                      <Chip label={formatCurrency(n.amount)} size="small" variant="outlined" sx={{ height: 20 }} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.5}>{n.message}</Typography>
                </Box>
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  aria-label="Dismiss"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          );
        })
      )}
    </Menu>
  );
}
