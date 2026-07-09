import api from './api';

export const listRecommendations = () =>
  api.get('/recommendations').then((r) => r.data);
