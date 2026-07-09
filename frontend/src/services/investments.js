import api from './api';

export const listInvestments = () => api.get('/investments').then((r) => r.data);
export const createInvestment = (data) => api.post('/investments', data).then((r) => r.data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);
