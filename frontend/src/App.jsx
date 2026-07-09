/**
 * Root routing and provider composition for FlexiBudget SPA.
 * See docs/FRONTEND.md for the full route table.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider } from './context/FinanceContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {
  ExecutiveDashboard,
  BudgetPlannerPage,
  TransactionsPage,
  IncomeManagerPage,
  ExpenseManagerPage,
  FinancialCalendarPage,
  GoalsPage,
  EmergencyFundPage,
  InvestmentsPage,
  ReportsPage,
  AnalyticsPage,
  PredictionsPage,
  SubscriptionsPage,
  AIInsightsPage,
  SettingsPage,
  ProfilePage,
  FutureLabPage,
} from './config/lazyPages';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<FinanceProvider><NotificationProvider><AppShell /></NotificationProvider></FinanceProvider>}>
                <Route path="/onboarding" element={<Box />} />
                <Route path="/dashboard" element={<ExecutiveDashboard />} />
                <Route path="/budget" element={<BudgetPlannerPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/income" element={<IncomeManagerPage />} />
                <Route path="/expenses" element={<ExpenseManagerPage />} />
                <Route path="/calendar" element={<FinancialCalendarPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/future-lab" element={<FutureLabPage />} />
                <Route path="/sandbox" element={<Navigate to="/future-lab" replace />} />
                <Route path="/emergency-fund" element={<EmergencyFundPage />} />
                <Route path="/investments" element={<InvestmentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/advise" element={<AIInsightsPage />} />
                <Route path="/ai-insights" element={<Navigate to="/advise" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
