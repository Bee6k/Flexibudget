import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  TextField, Alert, Link, Stack, InputAdornment, IconButton, FormControlLabel, Checkbox, Box, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AuthLayout from '../components/auth/AuthLayout';
import GradientButton from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';

function safeRedirectPath(pathname) {
  if (typeof pathname !== 'string') return '/dashboard';
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return '/dashboard';
  return pathname;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const from = safeRedirectPath(location.state?.from?.pathname);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser?.onboarding_completed === false ? '/dashboard' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your account.">
      <Stack component="form" onSubmit={onSubmit} spacing={2.25}>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          name="email"
          required
          autoFocus
          fullWidth
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type={showPass ? 'text' : 'password'}
          name="password"
          required
          fullWidth
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPass((s) => !s)}
                  edge="end"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <FormControlLabel
            disabled
            control={<Checkbox size="small" checked={false} />}
            label={<Box component="span" sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>Remember me</Box>}
            title="Coming soon"
            sx={{ m: 0 }}
          />
          <Typography
            component="span"
            variant="body2"
            color="text.disabled"
            sx={{ fontSize: '0.8125rem', cursor: 'default' }}
            title="Coming soon"
          >
            Forgot password?
          </Typography>
        </Box>
        <GradientButton
          type="submit"
          fullWidth
          disabled={submitting}
          size="large"
          sx={{ borderRadius: 999, py: 1.4, mt: 0.5 }}
        >
          {submitting ? 'Signing in…' : 'Log In'}
        </GradientButton>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ pt: 0.5 }}>
          New here?{' '}
          <Link component={RouterLink} to="/register" fontWeight={700} underline="hover">
            Create an account
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
