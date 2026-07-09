import api from './api';

export const listSubscriptions = () => api.get('/subscriptions').then((r) => r.data);
export const createSubscription = (data) => api.post('/subscriptions', data).then((r) => r.data);
export const deleteSubscription = (id) => api.delete(`/subscriptions/${id}`);
