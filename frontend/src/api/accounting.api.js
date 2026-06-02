// frontend/src/api/accounting.api.js
import api from './axios';

export const accountingApi = {
  getDashboard: (params) => api.get('/api/admin/accounting/dashboard', { params }),
  getStockMovements: (params) => api.get('/api/admin/accounting/stock-movements', { params }),
  createStockMovement: (data) => api.post('/api/admin/accounting/stock-movements', data),
  getExpenses: (params) => api.get('/api/admin/accounting/expenses', { params }),
  createExpense: (data) => api.post('/api/admin/accounting/expenses', data),
  updateExpense: (id, data) => api.put(`/api/admin/accounting/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/api/admin/accounting/expenses/${id}`),
  getSuppliers: () => api.get('/api/admin/accounting/suppliers'),
  createSupplier: (data) => api.post('/api/admin/accounting/suppliers', data),
  getProductMargins: () => api.get('/api/admin/accounting/product-margins'),
};