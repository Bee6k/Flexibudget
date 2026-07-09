import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Alert, Link, Stack, InputAdornment, IconButton } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AuthLayout from '../components/auth/AuthLayout';
import GradientButton from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || '/dashboard';

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
    <AuthLayout title="Welcome back" subtitle="Sign in to your financial command center.">
      <Stack component="form" onSubmit={onSubmit} spacing={2.5}>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          required
          autoFocus
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon fontSize="small" color="primary" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Password"
          type={showPass ? 'text' : 'password'}
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" color="primary" />
              </InputAdornment>
            ),
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
        <GradientButton type="submit" fullWidth disabled={submitting} size="large">
          {submitting ? 'Signing in…' : 'Sign in'}
        </GradientButton>
        <Link component={RouterLink} to="/register" variant="body2" align="center" fontWeight={600}>
          New to FlexiBudget? Create an account
        </Link>
      </Stack>
    </AuthLayout>
  );
}
