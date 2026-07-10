import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Badge, Avatar, Typography,
  Menu, MenuItem, ListItemIcon, Divider, Button, Chip, alpha, ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
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

export default function TopBar({ sidebarWidth, onMenuClick }) {
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
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const balance = view?.current_balance ?? 0;
  const pageTitle = PAGE_TITLES[location.pathname] || 'FlexiBudget';
  const expenseCount = view?.expenses?.length ?? 0;
  const incomeCount = view?.incomes?.length ?? 0;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
        zIndex: (t) => t.zIndex.appBar,
        pt: 'env(safe-area-inset-top, 0px)',
        backdropFilter: 'blur(10px)',
        bgcolor: (t) => alpha(t.palette.background.default, 0.85),
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 0.75, sm: 1.25 },
          py: { xs: 1, sm: 1.25 },
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.25, sm: 2, md: 3 },
        }}
      >
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{ display: { md: 'none' }, ml: -0.5 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            display={{ xs: 'none', sm: 'block' }}
            fontWeight={600}
            letterSpacing="0.05em"
          >
            {monthLabel.toUpperCase()}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              pr: 0.5,
            }}
          >
            {isDashboard ? 'Overview' : pageTitle}
          </Typography>
        </Box>

        {/* Compact balance — visible on phones */}
        <Chip
          size="small"
          onClick={() => setQuickAdd('balance')}
          label={formatCurrency(balance)}
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
            maxWidth: 120,
            height: 28,
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: isDark ? alpha('#fff', 0.06) : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
            color: balance > 0 ? 'success.main' : 'warning.main',
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />

        <Box
          onClick={() => setQuickAdd('balance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setQuickAdd('balance')}
          title="Click to update balance"
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
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: isDark ? 'rgba(45,212,191,0.35)' : 'rgba(21,42,69,0.25)',
            },
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
          Quick actions
        </Button>
        <IconButton
          size="small"
          sx={{
            display: { sm: 'none' },
            bgcolor: isDark ? TEAL : NAVY,
            color: '#FFFFFF',
            width: 36,
            height: 36,
            '&:hover': { bgcolor: isDark ? TEAL : NAVY, opacity: 0.9 },
          }}
          onClick={(e) => setAddMenu(e.currentTarget)}
          aria-label="Quick actions"
        >
          <AddIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={toggleMode}
          aria-label="Toggle theme"
        >
          {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
        </IconButton>

        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Reminders">
          <Badge badgeContent={unreadCount} color="error" max={9} invisible={!unreadCount}>
            <NotificationsNoneIcon fontSize="small" />
          </Badge>
        </IconButton>

        <IconButton
          onClick={(e) => setProfileMenu(e.currentTarget)}
          sx={{ p: 0.25 }}
          aria-label="Account menu"
        >
          <Avatar
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              bgcolor: isDark ? TEAL : NAVY,
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
        </IconButton>

        <Menu anchorEl={addMenu} open={Boolean(addMenu)} onClose={() => setAddMenu(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem onClick={() => { setQuickAdd('expense'); setAddMenu(null); }}>
            <ListItemIcon><CreditCardIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Add expense" />
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('income'); setAddMenu(null); }}>
            <ListItemIcon><TrendingUpIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText primary="Add income" />
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('balance'); setAddMenu(null); }}>
            <ListItemIcon><AccountBalanceIcon fontSize="small" color="secondary" /></ListItemIcon>
            <ListItemText primary="Update balance" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setQuickAdd('manage'); setAddMenu(null); }}>
            <ListItemIcon><ListAltOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary="Manage money"
              secondary={`${expenseCount} expenses · ${incomeCount} income`}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('manage-expenses'); setAddMenu(null); }}>
            <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary="Remove an expense" />
          </MenuItem>
          <MenuItem onClick={() => { setQuickAdd('manage-income'); setAddMenu(null); }}>
            <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary="Remove income" />
          </MenuItem>
        </Menu>

        <Menu anchorEl={profileMenu} open={Boolean(profileMenu)} onClose={() => setProfileMenu(null)}>
          <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => { toggleMode(); setProfileMenu(null); }}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <ListItemIcon>
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </ListItemIcon>
            {mode === 'dark' ? 'Light mode' : 'Dark mode'}
          </MenuItem>
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
