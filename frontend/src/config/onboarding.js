import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

export const ONBOARDING_TIERS = [
  {
    id: 1,
    label: 'Essentials',
    headline: 'What keeps you going?',
    subtitle: 'Rent, food, and other must-pay costs.',
    color: '#EF4444',
  },
  {
    id: 2,
    label: 'Stability',
    headline: 'What keeps life running?',
    subtitle: 'Bills, insurance, and regular upkeep.',
    color: '#F59E0B',
  },
  {
    id: 3,
    label: 'Goals',
    headline: 'What are you building toward?',
    subtitle: 'Savings, education, and growth.',
    color: '#3B82F6',
  },
  {
    id: 4,
    label: 'Lifestyle',
    headline: 'What do you enjoy?',
    subtitle: 'Dining, fun, and optional extras.',
    color: '#8B5CF6',
  },
];

export const ONBOARDING_ARCHETYPES = [
  {
    key: 'student',
    title: 'Student',
    tagline: 'Campus life & tight budgets',
    description: 'Tuition, rent, groceries, transit, and modest fun.',
    icon: SchoolOutlinedIcon,
    color: '#3B82F6',
  },
  {
    key: 'freelancer',
    title: 'Freelancer',
    tagline: 'Flexible income, smart planning',
    description: 'Irregular pay, insurance, tools, and coworking.',
    icon: WorkOutlineIcon,
    color: '#14B8A6',
  },
  {
    key: 'businessman',
    title: 'Business owner',
    tagline: 'Run the shop, track the costs',
    description: 'Payroll, inventory, rent, marketing, and operations.',
    icon: StorefrontOutlinedIcon,
    color: '#F59E0B',
  },
  {
    key: 'worker',
    title: 'Regular worker',
    tagline: 'Steady job, steady bills',
    description: 'Salary, rent, commute, savings, and everyday life.',
    icon: BadgeOutlinedIcon,
    color: '#8B5CF6',
  },
];

export function buildStepList() {
  const steps = ['welcome', 'archetype'];
  ONBOARDING_TIERS.forEach((tier) => {
    steps.push(`tier-${tier.id}-pick`, `tier-${tier.id}-review`);
  });
  steps.push('finances', 'complete');
  return steps;
}

export function stepMeta(step) {
  if (step === 'welcome') return { title: 'Welcome', section: 'Start' };
  if (step === 'archetype') return { title: 'Your profile', section: 'About you' };
  if (step === 'finances') return { title: 'Income & balance', section: 'Finances' };
  if (step === 'complete') return { title: 'All set', section: 'Done' };
  const pick = step.match(/^tier-(\d)-pick$/);
  if (pick) {
    const tier = ONBOARDING_TIERS.find((t) => t.id === Number(pick[1]));
    return { title: tier?.headline || tier?.label, section: `${tier?.label} · Pick` };
  }
  const review = step.match(/^tier-(\d)-review$/);
  if (review) {
    const tier = ONBOARDING_TIERS.find((t) => t.id === Number(review[1]));
    return { title: `Review ${tier?.label}`, section: `${tier?.label} · Refine` };
  }
  return { title: 'Setup', section: 'Onboarding' };
}

export function presetKey(name, tier) {
  return `${tier}::${name}`;
}

export function defaultDueDate(day = 1) {
  const d = new Date();
  const safeDay = Math.min(28, Math.max(1, Number(day) || 1));
  d.setDate(safeDay);
  if (d < new Date()) d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
