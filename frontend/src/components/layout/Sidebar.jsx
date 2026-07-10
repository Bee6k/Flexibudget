import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Tooltip, Divider, alpha, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { NAV_SECTIONS } from '../../config/navigation';
import { getNavIcon } from '../../config/navIcons';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL, TEAL_SOFT } from '../../theme/surfaces';

const WIDTH = 268;
const COLLAPSED = 76;

export default function Sidebar({ open, onToggle, mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const w = open ? WIDTH : COLLAPSED;
  const accent = isDark ? TEAL_SOFT : NAVY;
  const drawerWidth = isMobile ? WIDTH : w;

  function go(path) {
    navigate(path);
    if (isMobile) onMobileClose?.();
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      <Box sx={{ px: (isMobile || open) ? 2.5 : 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 72 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: isDark ? TEAL : NAVY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isDark ? '0 4px 12px rgba(45,212,191,0.28)' : '0 4px 12px rgba(30,58,95,0.2)',
          }}
        >
          <AccountBalanceWalletIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
        </Box>
        {(isMobile || open) && (
          <Box className="animate-stagger-item">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              FlexiBudget
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Smart money planning
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2, my: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }} />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.25 }}>
        {NAV_SECTIONS.map((section, si) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            {(isMobile || open) && (
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 1.5, py: 0.75, display: 'block' }}
              >
                {section.title}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item, ii) => {
                const Icon = getNavIcon(item.icon);
                const active = location.pathname === item.path;
                const isFutureLab = item.path === '/future-lab';
                const showLabel = isMobile || open;
                return (
                  <Tooltip key={item.path} title={!showLabel ? item.label : ''} placement="right">
                    <ListItemButton
                      selected={active}
                      onClick={() => go(item.path)}
                      className={`animate-stagger-item stagger-${Math.min(si + ii + 1, 6)}`}
                      sx={{
                        mx: 0.5,
                        mb: 0.5,
                        minHeight: 44,
                        justifyContent: showLabel ? 'initial' : 'center',
                        px: showLabel ? 1.75 : 1,
                        position: 'relative',
                        '&.Mui-selected': {
                          bgcolor: isDark ? alpha(TEAL_SOFT, 0.12) : alpha(NAVY, 0.08),
                          color: accent,
                          '& .MuiListItemIcon-root': { color: 'inherit' },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '18%',
                            bottom: '18%',
                            width: 3,
                            borderRadius: 999,
                            background: isFutureLab ? '#D97706' : accent,
                          },
                          '&:hover': {
                            bgcolor: isDark ? alpha(TEAL_SOFT, 0.16) : alpha(NAVY, 0.1),
                          },
                        },
                        '&:hover:not(.Mui-selected)': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: showLabel ? 38 : 0, justifyContent: 'center' }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      {showLabel && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 500,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {!isMobile && (
        <Box sx={{ px: 1.5, pt: 1.5, borderTop: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'divider' }}>
          <IconButton
            onClick={onToggle}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            sx={{
              width: '100%',
              borderRadius: 2.5,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  const paperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    transition: 'width 0.25s ease',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: (t) => t.zIndex.drawer,
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: w,
        flexShrink: 0,
        zIndex: (t) => t.zIndex.drawer,
        '& .MuiDrawer-paper': paperSx,
      }}
    >
      {drawer}
    </Drawer>
  );
}

export { WIDTH as SIDEBAR_WIDTH, COLLAPSED as SIDEBAR_COLLAPSED };
