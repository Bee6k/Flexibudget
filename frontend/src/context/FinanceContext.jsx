/**
 * FILE: context/FinanceContext.jsx
 *
 * Central financial store with full sandbox / what-if mode.
 * Sandbox changes are client-side until applySandbox() commits via existing APIs.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getDashboard } from '../services/dashboard';
import { listIncomes } from '../services/incomes';
import { listRecommendations } from '../services/recommendations';
import {
  flattenExpenses,
  deriveViewFromLive,
  deriveSandboxView,
} from '../utils/financeMetrics';
import {
  createSandboxFromLive,
  createEmptySandbox,
  resetSandboxData,
  generateTempId,
  isTempId,
} from '../utils/sandbox';
import { applySandboxToLive } from '../utils/sandboxApply';
import { STORAGE_KEYS } from '../config/storageKeys';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [live, setLive] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sandbox, setSandbox] = useState(null);
  const [quickAdd, setQuickAdd] = useState(null);
  const [applyingSandbox, setApplyingSandbox] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [dashboard, incomes] = await Promise.all([getDashboard(), listIncomes()]);
      setLive({
        user: dashboard.user,
        allocation: dashboard.allocation,
        horizon: dashboard.horizon,
        crisis: dashboard.crisis,
        expenses: flattenExpenses(dashboard.expenses_by_tier),
        incomes: incomes || [],
        expensesByTier: dashboard.expenses_by_tier,
      });
      if (dashboard.crisis?.state !== 'NORMAL') {
        try {
          setRecommendations(await listRecommendations());
        } catch {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load financial data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const inSandbox = Boolean(sandbox);

  const sandboxView = useMemo(
    () => (inSandbox ? deriveSandboxView(sandbox, live) : null),
    [inSandbox, sandbox, live],
  );

  const view = useMemo(() => deriveViewFromLive(live), [live]);

  const startSandbox = useCallback((mode, options = {}) => {
    let next;
    if (mode === 'fresh') {
      const balance = options.balance ?? live?.user?.current_balance ?? 0;
      next = createEmptySandbox(balance);
    } else {
      if (!live) return;
      next = createSandboxFromLive(live);
    }
    setSandbox(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SANDBOX_DRAFT, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, [live]);

  /** @deprecated use startSandbox('current') — kept for compatibility */
  const enableSandbox = useCallback(() => startSandbox('current'), [startSandbox]);

  const exitSandbox = useCallback((skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('Discard all sandbox changes and return to live data?')) return;
    setSandbox(null);
    localStorage.removeItem(STORAGE_KEYS.SANDBOX_DRAFT);
  }, []);

  const resetSandbox = useCallback(() => {
    if (!sandbox) return;
    if (!window.confirm('Reset sandbox to the state when you started? Current edits will be lost.')) return;
    setSandbox((prev) => {
      const reset = resetSandboxData(prev);
      try {
        localStorage.setItem(STORAGE_KEYS.SANDBOX_DRAFT, JSON.stringify(reset));
      } catch {
        /* ignore */
      }
      return reset;
    });
  }, [sandbox]);

  const persistSandboxDraft = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SANDBOX_DRAFT, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const updateSandbox = useCallback((updater) => {
    setSandbox((prev) => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistSandboxDraft(next);
      return next;
    });
  }, [persistSandboxDraft]);

  const sandboxUpdateBalance = useCallback((balance) => {
    const value = Number(balance);
    if (Number.isNaN(value) || value < 0) return;
    updateSandbox((prev) => ({ ...prev, current_balance: value }));
  }, [updateSandbox]);

  const sandboxAddExpense = useCallback((data) => {
    updateSandbox((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        {
          ...data,
          expense_id: generateTempId(),
          is_temporary: true,
          is_active: true,
        },
      ],
    }));
  }, [updateSandbox]);

  const sandboxUpdateExpense = useCallback((expenseId, data) => {
    updateSandbox((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (
        e.expense_id === expenseId ? { ...e, ...data } : e
      )),
    }));
  }, [updateSandbox]);

  const sandboxDeleteExpense = useCallback((expenseId) => {
    updateSandbox((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.expense_id !== expenseId),
    }));
  }, [updateSandbox]);

  const sandboxAddIncome = useCallback((data) => {
    updateSandbox((prev) => ({
      ...prev,
      incomes: [
        ...prev.incomes,
        {
          ...data,
          income_id: generateTempId(),
          is_temporary: true,
        },
      ],
    }));
  }, [updateSandbox]);

  const sandboxUpdateIncome = useCallback((incomeId, data) => {
    updateSandbox((prev) => ({
      ...prev,
      incomes: prev.incomes.map((i) => (
        i.income_id === incomeId ? { ...i, ...data } : i
      )),
    }));
  }, [updateSandbox]);

  const sandboxDeleteIncome = useCallback((incomeId) => {
    updateSandbox((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((i) => i.income_id !== incomeId),
    }));
  }, [updateSandbox]);

  const sandboxRestoreIncome = useCallback((incomeId) => {
    updateSandbox((prev) => {
      if (!prev?.snapshot) return prev;
      const orig = prev.snapshot.incomes.find((i) => i.income_id === incomeId);
      if (!orig || prev.incomes.some((i) => i.income_id === incomeId)) return prev;
      return {
        ...prev,
        incomes: [...prev.incomes, JSON.parse(JSON.stringify(orig))],
      };
    });
  }, [updateSandbox]);

  const sandboxRestoreExpense = useCallback((expenseId) => {
    updateSandbox((prev) => {
      if (!prev?.snapshot) return prev;
      const orig = prev.snapshot.expenses.find((e) => e.expense_id === expenseId);
      if (!orig || prev.expenses.some((e) => e.expense_id === expenseId)) return prev;
      return {
        ...prev,
        expenses: [...prev.expenses, JSON.parse(JSON.stringify(orig))],
      };
    });
  }, [updateSandbox]);

  const applySandbox = useCallback(async () => {
    if (!sandbox || !live) return false;
    if (!window.confirm('Apply all sandbox changes to your real budget? This cannot be undone.')) return false;

    setApplyingSandbox(true);
    setError('');
    try {
      await applySandboxToLive(live, sandbox);
      setSandbox(null);
      localStorage.removeItem(STORAGE_KEYS.SANDBOX_DRAFT);
      await refresh();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not apply sandbox changes. Your live data was not modified.');
      return false;
    } finally {
      setApplyingSandbox(false);
    }
  }, [sandbox, live, refresh]);

  useEffect(() => {
    if (!inSandbox) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [inSandbox]);

  useEffect(() => {
    if (loading || sandbox || !live) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SANDBOX_DRAFT);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.snapshot) {
        const restore = window.confirm('Restore your unsaved sandbox session from this browser?');
        if (restore) setSandbox(parsed);
        else localStorage.removeItem(STORAGE_KEYS.SANDBOX_DRAFT);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.SANDBOX_DRAFT);
    }
  }, [loading, sandbox, live]);

  return (
    <FinanceContext.Provider
      value={{
        live,
        view,
        sandboxView,
        recommendations,
        loading,
        error,
        setError,
        refresh,
        sandbox,
        setSandbox,
        inSandbox,
        applyingSandbox,
        startSandbox,
        enableSandbox,
        exitSandbox,
        resetSandbox,
        applySandbox,
        sandboxUpdateBalance,
        sandboxAddExpense,
        sandboxUpdateExpense,
        sandboxDeleteExpense,
        sandboxAddIncome,
        sandboxUpdateIncome,
        sandboxDeleteIncome,
        sandboxRestoreIncome,
        sandboxRestoreExpense,
        isTempId,
        quickAdd,
        setQuickAdd,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
