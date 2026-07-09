import { lazy } from 'react';

/** Code-split protected pages — loaded on first navigation. */
export const ExecutiveDashboard = lazy(() => import('../pages/ExecutiveDashboard'));
export const BudgetPlannerPage = lazy(() => import('../pages/BudgetPlannerPage'));
export const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
export const IncomeManagerPage = lazy(() => import('../pages/IncomeManagerPage'));
export const ExpenseManagerPage = lazy(() => import('../pages/ExpenseManagerPage'));
export const FinancialCalendarPage = lazy(() => import('../pages/FinancialCalendarPage'));
export const GoalsPage = lazy(() => import('../pages/GoalsPage'));
export const EmergencyFundPage = lazy(() => import('../pages/EmergencyFundPage'));
export const InvestmentsPage = lazy(() => import('../pages/InvestmentsPage'));
export const ReportsPage = lazy(() => import('../pages/ReportsPage'));
export const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
export const PredictionsPage = lazy(() => import('../pages/PredictionsPage'));
export const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));
export const AIInsightsPage = lazy(() => import('../pages/AIInsightsPage'));
export const SettingsPage = lazy(() => import('../pages/SettingsPage'));
export const ProfilePage = lazy(() => import('../pages/ProfilePage'));
export const FutureLabPage = lazy(() => import('../pages/FutureLabPage'));
