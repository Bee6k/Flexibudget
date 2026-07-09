import api from './api';

export const listIncomes = () => api.get('/incomes').then((r) => r.data);
export const createIncome = (data) => api.post('/incomes', data).then((r) => r.data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data).then((r) => r.data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);
