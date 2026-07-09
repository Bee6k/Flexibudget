import api from './api';

export const updateBalance = (current_balance) =>
  api.put('/users/balance', { current_balance }).then((r) => r.data);
export const completeOnboarding = (payload) =>
  api.put('/users/onboarding', payload).then((r) => r.data);
