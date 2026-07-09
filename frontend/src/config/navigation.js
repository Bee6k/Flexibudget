export const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Overview', icon: 'dashboard' },
      { path: '/analytics', label: 'Analytics', icon: 'analytics' },
      { path: '/predictions', label: 'Predictions', icon: 'predictions' },
      { path: '/reports', label: 'Reports', icon: 'reports' },
    ],
  },
  {
    title: 'Money',
    items: [
      { path: '/budget', label: 'Budget Planner', icon: 'budget' },
      { path: '/transactions', label: 'Transactions', icon: 'transactions' },
      { path: '/income', label: 'Income Manager', icon: 'income' },
      { path: '/expenses', label: 'Expense Manager', icon: 'expenses' },
    ],
  },
  {
    title: 'Planning',
    items: [
      { path: '/future-lab', label: 'Future Lab', icon: 'sandbox' },
      { path: '/calendar', label: 'Financial Calendar', icon: 'calendar' },
      { path: '/goals', label: 'Goals', icon: 'goals' },
      { path: '/emergency-fund', label: 'Emergency Fund', icon: 'emergency' },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { path: '/investments', label: 'Investments', icon: 'investments' },
      { path: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
    ],
  },
  {
    title: 'Intelligence',
    items: [{ path: '/advise', label: 'Advise', icon: 'ai' }],
  },
  {
    title: 'Account',
    items: [
      { path: '/settings', label: 'Settings', icon: 'settings' },
      { path: '/profile', label: 'Profile', icon: 'profile' },
    ],
  },
];

export const PAGE_TITLES = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.path, i.label]))
);
