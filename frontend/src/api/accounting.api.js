// frontend/src/api/accounting.api.js

import api from './axios';

export const accountingApi = {
  // Dashboard KPIs
  getDashboard: (params) => api.get('/admin/accounting/dashboard', { params }),

  // Mouvements de stock
  getStockMovements: (params) => api.get('/admin/accounting/stock-movements', { params }),
  createStockMovement: (data) => api.post('/admin/accounting/stock-movements', data),

  // Dépenses
  getExpenses: (params) => api.get('/admin/accounting/expenses', { params }),
  createExpense: (data) => api.post('/admin/accounting/expenses', data),
  updateExpense: (id, data) => api.put(`/admin/accounting/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/accounting/expenses/${id}`),

  // Fournisseurs
  getSuppliers: () => api.get('/admin/accounting/suppliers'),
  createSupplier: (data) => api.post('/admin/accounting/suppliers', data),

  // Marges produits
  getProductMargins: () => api.get('/admin/accounting/product-margins'),
};