import { useState } from 'react';
import {
  Box, Typography, Stack, Switch, FormControlLabel, Divider, Button, Alert,
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import { useThemeMode } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export default function SettingsPage() {
  const { mode, toggleMode } = useThemeMode();
  const { requestBrowserPermission } = useNotifications();
  const [browserStatus, setBrowserStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  async function enableBrowserAlerts() {
    const result = await requestBrowserPermission();
    setBrowserStatus(result);
  }

  return (
    <Box>
      <PageHeader badge="Preferences" title="Settings" subtitle="Personalize how FlexiBudget looks and works for you." />
      <GlassCard className="animate-stagger-item" sx={{ p: 3, maxWidth: 580 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          {mode === 'dark' ? <DarkModeOutlinedIcon color="primary" /> : <LightModeOutlinedIcon color="primary" />}
          <Typography variant="h6" fontWeight={800}>Appearance</Typography>
        </Stack>
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
          label={mode === 'dark' ? 'Dark theme (Aurora)' : 'Light theme'}
          sx={{ '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
        />
        <Divider sx={{ my: 2.5, borderColor: 'divider' }} />
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <NotificationsActiveOutlinedIcon color="secondary" />
          <Typography variant="h6" fontWeight={800}>Reminders</Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary" lineHeight={1.65} fontWeight={500}>
            Payment reminders appear in the bell icon 1 week and 1 day before monthly bills and subscriptions are due.
          </Typography>
          {browserStatus === 'granted' ? (
            <Alert severity="success" icon={<NotificationsActiveOutlinedIcon />}>
              Browser alerts are enabled for due-date reminders.
            </Alert>
          ) : browserStatus === 'denied' ? (
            <Alert severity="warning">
              Browser alerts are blocked. Allow notifications in your browser settings to get desktop reminders.
            </Alert>
          ) : browserStatus === 'unsupported' ? (
            <Typography variant="body2" color="text.secondary">Your browser does not support desktop notifications.</Typography>
          ) : (
            <Button variant="outlined" startIcon={<NotificationsActiveOutlinedIcon />} onClick={enableBrowserAlerts} sx={{ borderRadius: 2.5, alignSelf: 'flex-start' }}>
              Enable browser alerts
            </Button>
          )}
        </Stack>
        <Divider sx={{ my: 2.5, borderColor: 'divider' }} />
        <Typography variant="h6" fontWeight={800} gutterBottom>Preferences</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>Currency: NPR (Nepalese Rupee)</Typography>
      </GlassCard>
    </Box>
  );
}
