import { useFinance } from '../context/FinanceContext';

/**
 * Returns finance context when live dashboard data is loaded.
 * Use with `if (!finance) return <FinanceUnavailable />`.
 */
export function useFinanceView() {
  const ctx = useFinance();
  return ctx.view ? ctx : null;
}

/**
 * Returns finance context when raw `live` payload is available (Future Lab).
 */
export function useFinanceLive() {
  const ctx = useFinance();
  return ctx.live ? ctx : null;
}
