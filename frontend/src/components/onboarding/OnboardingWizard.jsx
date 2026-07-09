/**
 * FILE: components/onboarding/OnboardingWizard.jsx
 *
 * PURPOSE:
 * Full-screen first-run wizard — archetype selection, tier expense review, balance/income setup.
 *
 * RESPONSIBILITIES:
 * - Load presets from GET /presets/:archetype
 * - Bulk create expenses via POST /expenses/bulk
 * - Mark onboarding complete via PUT /users/onboarding
 *
 * SHOWN WHEN:
 * user.onboarding_completed === false (controlled by AppShell)
 *
 * See config/onboarding.js for step definitions and tier labels.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Stack, Grid, LinearProgress,
  Chip, Alert, CircularProgress, alpha, Badge,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../../context/AuthContext';
import { persistUser } from '../../utils/authSession';
import { useFinance } from '../../context/FinanceContext';
import { getPreset } from '../../services/presets';
import { bulkCreateExpenses } from '../../services/expenses';
import { createIncome } from '../../services/incomes';
import { updateBalance, completeOnboarding } from '../../services/users';
import { formatCurrency } from '../../utils/currency';
import { normalizeToMonthly } from '../../utils/onboardingAmounts';
import {
  ONBOARDING_ARCHETYPES, ONBOARDING_TIERS, buildStepList, stepMeta, presetKey, defaultDueDate,
} from '../../config/onboarding';
import TierReviewPanel from './TierReviewPanel';
import FloatingOrbs from '../motion/FloatingOrbs';
import StepTransition from '../motion/StepTransition';

const STEPS = buildStepList();

function newDraftItem(preset, tierId) {
  const originalFrequency = preset.frequency || 'monthly';
  let frequency = originalFrequency;
  let amount = Number(preset.default_amount) || 0;
  if (originalFrequency === 'weekly') {
    frequency = 'monthly';
    amount = normalizeToMonthly(amount, 'weekly');
  }
  const dueDay = '1';
  const dueDate = frequency === 'monthly'
    ? defaultDueDate(dueDay)
    : (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().slice(0, 10);
      })();
  return {
    localId: `${Date.now()}-${Math.random()}`,
    name: preset.name,
    amount: String(amount),
    baseAmount: frequency === 'yearly' ? Math.round(amount / 12) : amount,
    frequency,
    originalFrequency: originalFrequency !== frequency ? originalFrequency : null,
    priority_tier: tierId,
    due_date: dueDate,
    due_day: dueDay,
  };
}

function PickCard({ preset, tier, active, index, onToggle }) {
  const key = presetKey(preset.name, tier.id);
  const monthly = normalizeToMonthly(preset.default_amount, preset.frequency || 'monthly');

  return (
    <Grid item xs={12} sm={6} key={key}>
      <Paper
        onClick={() => onToggle(key)}
        className={active ? 'animate-pop-select' : undefined}
        sx={{
          p: 2,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: active ? tier.color : 'divider',
          bgcolor: active
            ? (t) => alpha(tier.color, t.palette.mode === 'dark' ? 0.14 : 0.08)
            : 'background.paper',
          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
          animationDelay: `${index * 0.06}s`,
          animation: `fadeSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.06}s both`,
          boxShadow: active ? `0 8px 24px ${alpha(tier.color, 0.25)}` : 'none',
          transform: active ? 'translateY(-2px)' : 'none',
          '&:hover': {
            borderColor: tier.color,
            transform: 'translateY(-3px)',
            boxShadow: `0 6px 20px ${alpha(tier.color, 0.18)}`,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight={700}>{preset.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ~{formatCurrency(monthly)}/month
            </Typography>
          </Box>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: active ? tier.color : 'divider',
              bgcolor: active ? tier.color : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {active && <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />}
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );
}

export default function OnboardingWizard({ open, forced = false, onClose }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { refresh } = useFinance();

  const [stepIndex, setStepIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('left');
  const [archetype, setArchetype] = useState(null);
  const [preset, setPreset] = useState([]);
  const [selected, setSelected] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [balance, setBalance] = useState('');
  const [incomeName, setIncomeName] = useState('Salary');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [loadingPreset, setLoadingPreset] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const meta = stepMeta(step);

  const currentTier = useMemo(() => {
    const m = step.match(/^tier-(\d)-/);
    return m ? ONBOARDING_TIERS.find((t) => t.id === Number(m[1])) : null;
  }, [step]);

  const tierPresets = useMemo(() => {
    if (!currentTier) return [];
    return preset.filter((p) => p.priority_tier === currentTier.id);
  }, [preset, currentTier]);

  const pickCount = currentTier ? (selected[currentTier.id] || []).length : 0;

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setSlideDir('left');
    setArchetype(null);
    setPreset([]);
    setSelected({});
    setReviewed({});
    setBalance('');
    setIncomeName('Salary');
    setIncomeAmount('');
    setError('');
  }, [open, forced]);

  useEffect(() => {
    if (!archetype) return;
    setLoadingPreset(true);
    getPreset(archetype)
      .then((data) => setPreset(Array.isArray(data) ? data : []))
      .catch(() => setPreset([]))
      .finally(() => setLoadingPreset(false));
  }, [archetype]);

  const goNext = useCallback(() => {
    setError('');
    setSlideDir('left');
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setError('');
    setSlideDir('right');
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  function togglePick(key) {
    if (!currentTier) return;
    setSelected((prev) => {
      const tierKeys = new Set(prev[currentTier.id] || []);
      if (tierKeys.has(key)) tierKeys.delete(key);
      else tierKeys.add(key);
      return { ...prev, [currentTier.id]: [...tierKeys] };
    });
  }

  function selectAllTier() {
    if (!currentTier) return;
    setSelected((prev) => ({
      ...prev,
      [currentTier.id]: tierPresets.map((p) => presetKey(p.name, currentTier.id)),
    }));
  }

  function clearTierPick() {
    if (!currentTier) return;
    setSelected((prev) => ({ ...prev, [currentTier.id]: [] }));
  }

  function continueFromPick() {
    if (!currentTier) return;
    const keys = selected[currentTier.id] || [];
    const items = tierPresets
      .filter((p) => keys.includes(presetKey(p.name, currentTier.id)))
      .map((p) => newDraftItem(p, currentTier.id));
    setReviewed((prev) => ({ ...prev, [currentTier.id]: items }));
    goNext();
  }

  function skipTierPick() {
    if (!currentTier) return;
    setReviewed((prev) => ({ ...prev, [currentTier.id]: [] }));
    goNext();
  }

  function updateReviewItem(tierId, localId, field, value) {
    setReviewed((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || []).map((item) => {
        if (item.localId !== localId) return item;
        const next = { ...item, [field]: value };
        if (field === 'due_day') next.due_date = defaultDueDate(value);
        return next;
      }),
    }));
  }

  function updateReviewFrequency(tierId, localId, frequency) {
    setReviewed((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || []).map((item) => {
        if (item.localId !== localId) return item;
        const prevFreq = item.frequency || 'monthly';
        if (prevFreq === frequency) return item;
        let amount = Number(item.amount) || 0;
        if (prevFreq === 'monthly' && frequency === 'yearly') amount = Math.round(amount * 12);
        if (prevFreq === 'yearly' && frequency === 'monthly') amount = Math.max(100, Math.round(amount / 12));
        const next = {
          ...item,
          frequency,
          amount: String(amount),
          baseAmount: frequency === 'monthly' ? amount : Math.round(amount / 12),
        };
        if (frequency === 'monthly') {
          next.due_date = defaultDueDate(next.due_day || 1);
        } else if (!next.due_date) {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          next.due_date = d.toISOString().slice(0, 10);
        }
        return next;
      }),
    }));
  }

  function addCustomReviewItem(tierId, { name, amount, frequency = 'monthly' }) {
    const dueDay = '1';
    setReviewed((prev) => ({
      ...prev,
      [tierId]: [
        ...(prev[tierId] || []),
        {
          localId: `custom-${Date.now()}`,
          name,
          amount: String(amount),
          baseAmount: frequency === 'yearly' ? Math.round(amount / 12) : amount,
          frequency,
          priority_tier: tierId,
          due_date: frequency === 'monthly' ? defaultDueDate(dueDay) : (() => {
            const d = new Date();
            d.setMonth(d.getMonth() + 1);
            return d.toISOString().slice(0, 10);
          })(),
          due_day: dueDay,
          isCustom: true,
        },
      ],
    }));
  }

  function removeReviewItem(tierId, localId) {
    setReviewed((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || []).filter((i) => i.localId !== localId),
    }));
  }

  const allReviewedExpenses = useMemo(
    () => ONBOARDING_TIERS.flatMap((t) => reviewed[t.id] || []),
    [reviewed]
  );

  async function finishSetup() {
    setSubmitting(true);
    setError('');
    try {
      const valid = allReviewedExpenses.filter((e) => e.name.trim() && Number(e.amount) > 0);
      if (valid.length > 0) {
        await bulkCreateExpenses(
          valid.map((e) => ({
            name: e.name.trim(),
            amount: Number(e.amount),
            frequency: e.frequency || 'monthly',
            priority_tier: e.priority_tier,
            due_date: (e.frequency || 'monthly') === 'monthly'
              ? (e.due_date || defaultDueDate(e.due_day))
              : (e.due_date || null),
          }))
        );
      }

      const bal = Number(balance);
      if (!Number.isNaN(bal) && bal >= 0 && balance !== '') {
        await updateBalance(bal);
      }

      const inc = Number(incomeAmount);
      if (!Number.isNaN(inc) && inc > 0 && incomeName.trim()) {
        await createIncome({
          source_name: incomeName.trim(),
          amount: inc,
          expected_date: new Date().toISOString().slice(0, 10),
          is_recurring: true,
        });
      }

      const updatedUser = await completeOnboarding({ archetype, onboarding_completed: true });
      setUser(updatedUser);
      persistUser(updatedUser);
      await refresh();
      setSlideDir('left');
      setStepIndex(STEPS.length - 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not finish setup. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function skipAll() {
    setSubmitting(true);
    try {
      const updatedUser = await completeOnboarding({ onboarding_completed: true });
      setUser(updatedUser);
      persistUser(updatedUser);
      onClose?.();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not skip setup.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDone() {
    onClose?.();
    navigate('/dashboard', { replace: true });
  }

  if (!open) return null;

  const tierAccent = currentTier?.color || '#14B8A6';

  return (
    <>
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (t) => alpha(t.palette.background.default, 0.94),
        backdropFilter: 'blur(16px)',
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <FloatingOrbs color={tierAccent} />

      <Paper
        elevation={0}
        className="animate-scale-in"
        sx={{
          width: '100%',
          maxWidth: 920,
          maxHeight: 'min(92vh, 860px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          borderRadius: 4,
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(160deg, rgba(24, 32, 48, 0.98) 0%, rgba(12, 18, 32, 0.99) 100%)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)',
          border: '1px solid',
          borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
          boxShadow: (t) =>
            t.palette.mode === 'dark'
              ? '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,191,0.08)'
              : '0 24px 64px rgba(15,23,42,0.12)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Box className="animate-fade-in">
              <Typography variant="overline" color="primary.main" fontWeight={700}>
                {forced ? 'Setup wizard' : `Welcome, ${user?.name?.split(' ')[0] || 'there'}`}
              </Typography>
              <Typography variant="h5" fontWeight={800}>{meta.title}</Typography>
              <Typography variant="body2" color="text.secondary">{meta.section}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Step {stepIndex + 1} of {STEPS.length}
            </Typography>
          </Stack>
          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3, transition: 'transform 0.4s ease' }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                animation: 'progressShine 2.5s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3 }, py: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <StepTransition stepKey={step} direction={slideDir === 'left' ? 'left' : 'right'}>
            <Box>
              {step === 'welcome' && (
                <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: { xs: 2, md: 4 } }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulseGlow 2.5s ease-in-out infinite',
                    }}
                  >
                    <RocketLaunchOutlinedIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Box sx={{ maxWidth: 520 }} className="animate-stagger-item">
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                      Let&apos;s set up your money map
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                      Tap through each section — no long forms. Everything is monthly and editable later.
                    </Typography>
                  </Box>
                  <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                    {ONBOARDING_TIERS.map((t, i) => (
                      <Chip
                        key={t.id}
                        label={t.label}
                        size="small"
                        sx={{
                          borderColor: t.color,
                          color: t.color,
                          animation: `fadeSlideUp 0.4s ease ${0.2 + i * 0.08}s both`,
                        }}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              )}

              {step === 'archetype' && (
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: 560 }}>
                    Tap the profile that fits you best — we&apos;ll suggest monthly expenses you can tweak with one tap.
                  </Typography>
                  <Grid container spacing={2}>
                    {ONBOARDING_ARCHETYPES.map((a, index) => {
                      const Icon = a.icon;
                      const active = archetype === a.key;
                      return (
                        <Grid item xs={12} sm={6} key={a.key}>
                          <Paper
                            onClick={() => setArchetype(a.key)}
                            className={active ? 'animate-pop-select' : undefined}
                            sx={{
                              p: 2.5,
                              cursor: 'pointer',
                              height: '100%',
                              border: '2px solid',
                              borderColor: active ? a.color : 'divider',
                              bgcolor: active ? (t) => alpha(a.color, t.palette.mode === 'dark' ? 0.14 : 0.08) : 'background.paper',
                              transition: 'all 0.25s',
                              animation: `fadeSlideUp 0.45s ease ${index * 0.08}s both`,
                              '&:hover': { borderColor: a.color, transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${alpha(a.color, 0.2)}` },
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${a.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon sx={{ color: a.color }} />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="subtitle1" fontWeight={700}>{a.title}</Typography>
                                  {active && <CheckCircleIcon sx={{ color: a.color, fontSize: 20 }} />}
                                </Stack>
                                <Typography variant="caption" color="primary.main" fontWeight={600}>{a.tagline}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{a.description}</Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {step.endsWith('-pick') && currentTier && (
                <Box>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 3,
                      background: (t) => `linear-gradient(135deg, ${alpha(currentTier.color, 0.15)} 0%, ${alpha(t.palette.background.paper, 1)} 70%)`,
                      border: '1px solid',
                      borderColor: alpha(currentTier.color, 0.3),
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: currentTier.color, boxShadow: `0 0 12px ${currentTier.color}` }} />
                      <Box>
                        <Typography variant="h6" fontWeight={800}>{currentTier.headline}</Typography>
                        <Typography variant="body2" color="text.secondary">{currentTier.subtitle}</Typography>
                      </Box>
                      {pickCount > 0 && (
                        <Badge badgeContent={pickCount} color="primary" sx={{ ml: 'auto' }}>
                          <AutoAwesomeIcon color="action" />
                        </Badge>
                      )}
                    </Stack>
                  </Paper>

                  {loadingPreset ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
                  ) : tierPresets.length === 0 ? (
                    <Alert severity="info">No suggestions here — tap &quot;Nothing here&quot; to skip.</Alert>
                  ) : (
                    <>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip label="Select all" clickable onClick={selectAllTier} variant="outlined" size="small" />
                        <Chip label="Clear" clickable onClick={clearTierPick} variant="outlined" size="small" />
                      </Stack>
                      <Grid container spacing={1.5}>
                        {tierPresets.map((p, index) => (
                          <PickCard
                            key={presetKey(p.name, currentTier.id)}
                            preset={p}
                            tier={currentTier}
                            active={(selected[currentTier.id] || []).includes(presetKey(p.name, currentTier.id))}
                            index={index}
                            onToggle={togglePick}
                          />
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              )}

              {step.endsWith('-review') && currentTier && (
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Tap amounts and pick monthly or yearly — use &quot;Add another item&quot; to add more.
                  </Typography>
                  <TierReviewPanel
                    tier={currentTier}
                    items={reviewed[currentTier.id] || []}
                    isLifestyle={currentTier.id === 4}
                    defaultShowAddForm={(reviewed[currentTier.id] || []).length === 0}
                    onAmountChange={(localId, amount) => updateReviewItem(currentTier.id, localId, 'amount', amount)}
                    onDueDayChange={(localId, day) => updateReviewItem(currentTier.id, localId, 'due_day', day)}
                    onFrequencyChange={(localId, freq) => updateReviewFrequency(currentTier.id, localId, freq)}
                    onNameChange={(localId, name) => updateReviewItem(currentTier.id, localId, 'name', name)}
                    onDueDateChange={(localId, date) => updateReviewItem(currentTier.id, localId, 'due_date', date)}
                    onRemove={(localId) => removeReviewItem(currentTier.id, localId)}
                    onAdd={(payload) => addCustomReviewItem(currentTier.id, payload)}
                  />
                </Box>
              )}

              {step === 'finances' && (
                <Stack spacing={3} sx={{ maxWidth: 480, mx: 'auto', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                    Almost done — optional starting balance and monthly income.
                  </Typography>
                  <Paper sx={{ p: 2.5, borderRadius: 3 }} className="animate-stagger-item">
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Current balance</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                      {[0, 5000, 15000, 30000, 50000].map((v) => (
                        <Chip
                          key={v}
                          label={v === 0 ? 'Skip' : formatCurrency(v)}
                          clickable
                          color={String(balance) === String(v) ? 'primary' : 'default'}
                          variant={String(balance) === String(v) ? 'filled' : 'outlined'}
                          onClick={() => setBalance(v === 0 ? '' : String(v))}
                        />
                      ))}
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2.5, borderRadius: 3 }} className="animate-stagger-item" style={{ animationDelay: '0.08s' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Main monthly income</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {[25000, 40000, 60000, 80000, 120000].map((v) => (
                        <Chip
                          key={v}
                          label={formatCurrency(v)}
                          clickable
                          color={String(incomeAmount) === String(v) ? 'primary' : 'default'}
                          variant={String(incomeAmount) === String(v) ? 'filled' : 'outlined'}
                          onClick={() => setIncomeAmount(String(v))}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {step === 'complete' && (
                <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ py: { xs: 3, md: 5 } }}>
                  <CheckCircleIcon
                    sx={{
                      fontSize: 72,
                      color: 'success.main',
                      animation: 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  />
                  <Typography variant="h4" fontWeight={800}>You&apos;re all set!</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440 }}>
                    {allReviewedExpenses.filter((e) => e.name.trim()).length} expense
                    {allReviewedExpenses.filter((e) => e.name.trim()).length === 1 ? '' : 's'} saved.
                    Your dashboard is ready.
                  </Typography>
                </Stack>
              )}
            </Box>
          </StepTransition>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              {stepIndex > 0 && step !== 'complete' && (
                <Button startIcon={<ArrowBackIcon />} onClick={goBack} disabled={submitting}>Back</Button>
              )}
              {step === 'welcome' && !forced && (
                <Button color="inherit" onClick={skipAll} disabled={submitting}>Set up later</Button>
              )}
            </Box>
            <Stack direction="row" spacing={1}>
              {step === 'welcome' && (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext} size="large">Let&apos;s go</Button>
              )}
              {step === 'archetype' && (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext} disabled={!archetype} size="large">Continue</Button>
              )}
              {step.endsWith('-pick') && (
                <>
                  <Button onClick={skipTierPick}>Nothing here</Button>
                  <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={continueFromPick}>
                    Review{pickCount > 0 ? ` (${pickCount})` : ''}
                  </Button>
                </>
              )}
              {step.endsWith('-review') && (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext}>
                  {currentTier?.id === 4 ? 'Continue to finances' : `Next: ${ONBOARDING_TIERS.find((t) => t.id === (currentTier.id + 1))?.label}`}
                </Button>
              )}
              {step === 'finances' && (
                <Button variant="contained" onClick={finishSetup} disabled={submitting} size="large">
                  {submitting ? <CircularProgress size={22} /> : 'Finish setup'}
                </Button>
              )}
              {step === 'complete' && (
                <Button variant="contained" size="large" onClick={handleDone}>Open dashboard</Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
    </>
  );
}
