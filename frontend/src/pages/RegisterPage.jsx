import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TextField, Alert, Link, Stack, Typography } from '@mui/material';
import AuthLayout from '../components/auth/AuthLayout';
import GradientButton from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return 'Password must include at least one letter and one number.';
    }
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Sign up and we'll walk you through a quick budget setup.">
      <Stack component="form" onSubmit={onSubmit} spacing={2.25}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Full name"
          required
          fullWidth
          autoFocus
          value={form.name}
          onChange={update('name')}
        />
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          value={form.email}
          onChange={update('email')}
        />
        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          helperText="At least 8 characters, with one letter and one number"
          value={form.password}
          onChange={update('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          required
          fullWidth
          value={form.confirm}
          onChange={update('confirm')}
        />
        <GradientButton type="submit" fullWidth disabled={submitting} size="large" sx={{ borderRadius: 999, py: 1.4 }}>
          {submitting ? 'Creating…' : 'Create account'}
        </GradientButton>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ pt: 0.5 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
