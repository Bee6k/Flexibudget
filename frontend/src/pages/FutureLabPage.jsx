import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography, Fab, alpha, Grid,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import FutureLabIntro from '../components/futureLab/FutureLabIntro';
import InsightHero from '../components/futureLab/InsightHero';
import SurvivalMeter from '../components/futureLab/SurvivalMeter';
import ScenarioBuilder from '../components/futureLab/ScenarioBuilder';
import SmartQuestions from '../components/futureLab/SmartQuestions';
import ScenarioStory from '../components/futureLab/ScenarioStory';
import MoneyJourney from '../components/futureLab/MoneyJourney';
import InteractiveTimeline from '../components/futureLab/InteractiveTimeline';
import RecommendationCards from '../components/futureLab/RecommendationCards';
import FinancialDoctor from '../components/futureLab/FinancialDoctor';
import PlaygroundSliders from '../components/futureLab/PlaygroundSliders';
import { useFinanceLive } from '../hooks/useFinanceReady';
import { STORAGE_KEYS } from '../config/storageKeys';
import {
  projectViews,
  buildInsightSummary,
  buildScenarioStory,
  buildMoneyJourney,
  buildInteractiveTimeline,
  buildRecommendations,
  buildFinancialDoctor,
  parseSmartQuestion,
  applyScenarioCard,
  applySmartActions,
  applyRecommendationAction,
  computeStressScore,
} from '../utils/futureLabEngine';

const DEFAULT_PLAYGROUND = { incomeBoost: 0, expenseBoost: 0, balanceAdjust: 0, inflation: 0 };

export default function FutureLabPage() {
  const navigate = useNavigate();
  const finance = useFinanceLive();
  const {
    live,
    sandbox,
    setSandbox,
    inSandbox,
    startSandbox,
    exitSandbox,
    resetSandbox,
    applySandbox,
    applyingSandbox,
  } = finance || {};

  const [playground, setPlayground] = useState(DEFAULT_PLAYGROUND);
  const [smartMsg, setSmartMsg] = useState('');
  const [eventDialog, setEventDialog] = useState(null);
  const [freshDialog, setFreshDialog] = useState(false);
  const [freshBalance, setFreshBalance] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);
  const [appliedCardIds, setAppliedCardIds] = useState([]);
  const [storyPulse, setStoryPulse] = useState(0);
  const [activeLabel, setActiveLabel] = useState('');

  const { scenarioView, baselineView } = useMemo(
    () => (inSandbox && sandbox ? projectViews(sandbox, live, playground) : { scenarioView: null, baselineView: null }),
    [inSandbox, sandbox, live, playground],
  );

  const insight = useMemo(
    () => (scenarioView && baselineView ? buildInsightSummary(baselineView, scenarioView, sandbox) : null),
    [scenarioView, baselineView, sandbox],
  );

  const story = useMemo(() => (sandbox && insight ? buildScenarioStory(sandbox, insight) : []), [sandbox, insight]);
  const journey = useMemo(() => (scenarioView ? buildMoneyJourney(scenarioView) : []), [scenarioView]);
  const timeline = useMemo(() => (scenarioView ? buildInteractiveTimeline(scenarioView) : []), [scenarioView]);
  const recommendations = useMemo(
    () => (sandbox && scenarioView && baselineView ? buildRecommendations(sandbox, scenarioView, baselineView) : []),
    [sandbox, scenarioView, baselineView],
  );
  const doctorIssues = useMemo(
    () => (scenarioView && insight ? buildFinancialDoctor(scenarioView, insight) : []),
    [scenarioView, insight],
  );
  const stressScore = useMemo(() => computeStressScore(insight, doctorIssues), [insight, doctorIssues]);

  const persist = useCallback((next) => {
    setSandbox(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SANDBOX_DRAFT, JSON.stringify(next));
    } catch { /* ignore */ }
  }, [setSandbox]);

  const markApplied = useCallback((card) => {
    setActiveCardId(card.id);
    setActiveLabel(card.label);
    setAppliedCardIds((ids) => (ids.includes(card.id) ? ids : [...ids, card.id]));
    setStoryPulse((n) => n + 1);
  }, []);

  const handlePlayground = (key, value) => setPlayground((p) => ({ ...p, [key]: value }));

  const handleCard = (card) => {
    if (card.type === 'custom' || card.type === 'income') {
      setEventDialog({ card, form: { name: '', amount: card.type === 'income' ? '10000' : '' } });
      return;
    }
    persist(applyScenarioCard(sandbox, card));
    markApplied(card);
  };

  const confirmEvent = () => {
    if (!eventDialog) return;
    const { card, form } = eventDialog;
    persist(applyScenarioCard(sandbox, card, { name: form.name, amount: Number(form.amount) }));
    markApplied(card);
    setEventDialog(null);
  };

  const handleSmartAsk = (question) => {
    const parsed = parseSmartQuestion(question);
    if (!parsed.understood) {
      setSmartMsg(parsed.message);
      return;
    }
    setSmartMsg(parsed.message);
    persist(applySmartActions(sandbox, parsed.actions));
    setStoryPulse((n) => n + 1);
    setActiveLabel(question);
  };

  const handleRecApply = (rec) => {
    if (rec.action) persist(applyRecommendationAction(sandbox, rec.action));
  };

  const handleReset = () => {
    resetSandbox();
    setPlayground(DEFAULT_PLAYGROUND);
    setActiveCardId(null);
    setAppliedCardIds([]);
    setActiveLabel('');
    setStoryPulse(0);
    setSmartMsg('');
  };

  async function handleSave() {
    const ok = await applySandbox();
    if (ok) navigate('/dashboard');
  }

  if (!finance) return <FinanceUnavailable />;

  return (
    <Box className="future-lab-page animate-page-enter" sx={{ pb: 10, maxWidth: 1120, mx: 'auto', pt: 1 }}>
      {!inSandbox && (
        <FutureLabIntro
          balance={live.user?.current_balance}
          onCurrent={() => startSandbox('current')}
          onFresh={() => {
            setFreshBalance(String(live.user?.current_balance ?? 0));
            setFreshDialog(true);
          }}
        />
      )}

      {inSandbox && scenarioView && insight && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
            <Box>
              <Box className="future-lab-badge" sx={{ mb: 1 }}>
                Future Lab · Safe to experiment
              </Box>
              <Typography variant="body2" color="text.secondary">
                Playing with tomorrow — your real budget is untouched.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<RestartAltIcon />} onClick={handleReset}>
                Reset
              </Button>
              <Button size="small" startIcon={<CloseIcon />} onClick={() => { exitSandbox(); navigate('/dashboard'); }}>
                Leave
              </Button>
            </Stack>
          </Stack>

          <InsightHero insight={insight} showCompare={sandbox?.setupMode === 'current'} />
          <SurvivalMeter insight={insight} stressScore={stressScore} scenarioView={scenarioView} />

          <SmartQuestions onAsk={handleSmartAsk} lastMessage={smartMsg} />

          <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  height: '100%',
                  maxHeight: { md: 'min(640px, 78vh)' },
                  overflow: 'auto',
                  borderRadius: 3,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <ScenarioBuilder
                  onSelect={handleCard}
                  activeId={activeCardId}
                  appliedIds={appliedCardIds}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={7} sx={{ minWidth: 0, display: 'flex' }}>
              <Box sx={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <ScenarioStory
                  steps={story}
                  pulseKey={storyPulse}
                  activeLabel={activeLabel}
                />
              </Box>
            </Grid>
          </Grid>

          <PlaygroundSliders values={playground} onChange={handlePlayground} />
          <RecommendationCards recommendations={recommendations} onApply={handleRecApply} />
          <FinancialDoctor issues={doctorIssues} />
          <MoneyJourney nodes={journey} />
          <InteractiveTimeline milestones={timeline} />

          <Fab
            variant="extended"
            color="success"
            onClick={handleSave}
            disabled={applyingSandbox}
            sx={{
              position: 'fixed',
              bottom: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 24 },
              right: { xs: 16, sm: 24 },
              fontWeight: 600,
              borderRadius: 99,
              px: { xs: 2, sm: 3 },
              zIndex: 1200,
              boxShadow: (t) => `0 8px 32px ${alpha(t.palette.success.main, 0.4)}`,
            }}
          >
            <SaveOutlinedIcon sx={{ mr: 1 }} />
            {applyingSandbox ? 'Saving…' : 'Save to real budget'}
          </Fab>
        </>
      )}

      <Dialog open={freshDialog} onClose={() => setFreshDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Imagine a new life</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            How much money do you start with in this imaginary world?
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Starting money (NPR)"
            value={freshBalance}
            onChange={(e) => setFreshBalance(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFreshDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              startSandbox('fresh', { balance: Number(freshBalance) || 0 });
              setFreshDialog(false);
            }}
          >
            Enter Future Lab
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(eventDialog)} onClose={() => setEventDialog(null)} maxWidth="xs" fullWidth>
        {eventDialog && (
          <>
            <DialogTitle>{eventDialog.card.label}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Name"
                  value={eventDialog.form.name}
                  onChange={(e) => setEventDialog((d) => ({ ...d, form: { ...d.form, name: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label="Amount (NPR)"
                  type="number"
                  value={eventDialog.form.amount}
                  onChange={(e) => setEventDialog((d) => ({ ...d, form: { ...d.form, amount: e.target.value } }))}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDialog(null)}>Cancel</Button>
              <Button variant="contained" onClick={confirmEvent}>Add to scenario</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
