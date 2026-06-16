import { apiClient } from '../store/authStore'

export const expenseApi = {
  getExpenses: () => apiClient.get('/expenses'),
  addExpense: (expense) => apiClient.post('/expenses', expense),
  deleteExpense: (id) => apiClient.delete(`/expenses/${id}`),
  getSummary: () => apiClient.get('/expenses/summary')
};
