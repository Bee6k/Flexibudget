import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Badge, Avatar, Typography,
  Menu, MenuItem, ListItemIcon, Divider, Button, Chip, alpha,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/currency';
import { statusLabel } from '../../utils/copy';
import { getInitials } from '../../utils/initials';
import { PAGE_TITLES } from '../../config/navigation';
import { NAVY, TEAL } from '../../theme/surfaces';
import NotificationMenu from './NotificationMenu';

export default function TopBar({ sidebarWidth }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { view, setQuickAdd } = useFinance();
  const { unreadCount } = useNotifications();
  const crisis = view?.crisis;
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = useState(null);
  const [addMenu, setAddMenu] = useState(null);
  const [profileMenu, setProfileMenu] = useState(null);
  const isDark = mode === 'dark';

  const isDashboard = location.pathname === '/dashboard';
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const balance = view?.current_balance ?? 0;
  const pageTitle = PAGE_TITLES[location.pathname] || 'FlexiBudget';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{ width: `calc(100% - ${sidebarWidth}px)`, zIndex: (t) => t.zIndex.appBar }}
    >
      <Toolbar sx={{ gap: { xs: 1, md: 1.5 }, py: 1.5, minHeight: { xs: 60, sm: 68 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} letterSpacing="0.05em">
            {monthLabel.toUpperCase()}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            {isDashboard ? 'Financial Overview' : pageTitle}
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.04)',
          }}
        >
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
              Available
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: balance > 0 ? 'success.main' : 'warning.main',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {formatCurrency(balance)}
            </Typography>
          </Box>
          {!isDashboard && crisis?.state && crisis.state !== 'NORMAL' && (
            <Chip
              size="small"
              label={statusLabel(crisis.state)}
              sx={{
                height: 26,
                fontWeight: 700,
                bgcolor: crisis.state === 'CRISIS' ? 'error.main' : 'warning.main',
                color: '#fff',
              }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={(e) => setAddMenu(e.currentTarget)}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Quick add
        </Button>
        <IconButton
          sx={{
            display: { sm: 'none' },
            bgcolor: isDark ? TEAL : NAVY,
            color: '#FFFFFF',
            '&:hover': { bgcolor: isDark ? TEAL : NAVY, opacity: 0.9 },
          }}
          onClick={(e) => setAddMenu(e.currentTarget)}
          aria-label="Quick add"
        >
          <AddIcon />
        </IconButton>

        <IconButton onClick={toggleMode} aria-label="Toggle theme" sx={{ border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
          {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Reminders" sx={{ border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
          <Badge badgeContent={unreadCount} color="error" max={9} invisible={!unreadCount}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        <IconButton
          onClick={(e) => setProfileMenu(e.currentTarget)}
          sx={{ p: 0.25 }}
          aria-label="Account menu"
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isDark ? TEAL : NAVY,
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
        </IconButton>

        <Menu anchorEl={addMenu} open={Boolean(addMenu)} onClose={() => setAddMenu(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem onClick={() => { setQuickAdd('expense'); setAddMenu(null); }}>
            <ListItemIcon><CreditCardIcon fontSize="small" color="primary" /></ListItemIcon>
            Add expense
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('income'); setAddMenu(null); }}>
            <ListItemIcon><TrendingUpIcon fontSize="small" color="success" /></ListItemIcon>
            Add income
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('balance'); setAddMenu(null); }}>
            <ListItemIcon><AccountBalanceIcon fontSize="small" color="secondary" /></ListItemIcon>
            Update balance
          </MenuItem>
        </Menu>

        <Menu anchorEl={profileMenu} open={Boolean(profileMenu)} onClose={() => setProfileMenu(null)}>
          <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/profile'); setProfileMenu(null); }}>
            <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); setProfileMenu(null); }}>
            <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { logout(); setProfileMenu(null); }} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>

        <NotificationMenu anchor={anchor} onClose={() => setAnchor(null)} />
      </Toolbar>
    </AppBar>
  );
}
