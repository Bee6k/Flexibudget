import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import AnalyticsIcon from '@mui/icons-material/InsightsOutlined';
import PredictionsIcon from '@mui/icons-material/TimelineOutlined';
import ReportsIcon from '@mui/icons-material/AssessmentOutlined';
import BudgetIcon from '@mui/icons-material/DonutLargeOutlined';
import TransactionsIcon from '@mui/icons-material/ReceiptLongOutlined';
import IncomeIcon from '@mui/icons-material/TrendingUpOutlined';
import ExpensesIcon from '@mui/icons-material/CreditCardOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import GoalsIcon from '@mui/icons-material/FlagOutlined';
import EmergencyIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import InvestmentsIcon from '@mui/icons-material/AccountBalanceOutlined';
import SubscriptionsIcon from '@mui/icons-material/SubscriptionsOutlined';
import AiIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ProfileIcon from '@mui/icons-material/PersonOutline';

const MAP = {
  dashboard: DashboardIcon,
  analytics: AnalyticsIcon,
  predictions: PredictionsIcon,
  reports: ReportsIcon,
  budget: BudgetIcon,
  transactions: TransactionsIcon,
  income: IncomeIcon,
  expenses: ExpensesIcon,
  calendar: CalendarIcon,
  goals: GoalsIcon,
  sandbox: ScienceOutlinedIcon,
  emergency: EmergencyIcon,
  investments: InvestmentsIcon,
  subscriptions: SubscriptionsIcon,
  ai: AiIcon,
  settings: SettingsIcon,
  profile: ProfileIcon,
};

export function getNavIcon(key) {
  return MAP[key] || DashboardIcon;
}
