import api from './api';

export const createExpense = (data) => api.post('/expenses', data).then((r) => r.data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then((r) => r.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const bulkCreateExpenses = (items) => api.post('/expenses/bulk', { items }).then((r) => r.data);
