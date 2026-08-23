// frontend/src/api/product-suppliers.api.js
import api from './axios';

export const productSuppliersApi = {
  getProducts: (params) =>
    api.get('/api/admin/product-suppliers', { params }),
  setSuppliers: (productId, supplierIds) =>
    api.put(`/api/admin/product-suppliers/${productId}`, { supplierIds }),
  bulkUpdate: (data) =>
    api.post('/api/admin/product-suppliers/bulk', data),
  getOrderSuppliers: (orderId) =>
    api.get(`/api/admin/orders/${orderId}/suppliers`),
};
