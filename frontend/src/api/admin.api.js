import api from './axios';
import { API_URL, AUTH_TOKEN_KEY } from '../utils/constants';

async function downloadBlob(url, filename, errorMessage) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || errorMessage);
  }
  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(objectUrl);
}

function buildQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const adminApi = {
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updatePayment: (id, data) => api.patch(`/api/admin/orders/${id}/payment`, data),
  getInvoices: (params) => api.get('/api/admin/invoices', { params }),
  getInvoiceByOrder: (orderId) => api.get(`/api/admin/invoices/order/${orderId}`),
  getInvoiceById: (id) => api.get(`/api/admin/invoices/${id}`),
  getAuditLogs: (params) => api.get('/api/admin/audit', { params }),
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.put('/api/settings', data),

  downloadInvoicePdf(invoiceId, invoiceNumber) {
    return downloadBlob(
      `${API_URL}/api/admin/invoices/${invoiceId}/pdf`,
      `${invoiceNumber || 'facture'}.pdf`,
      'Impossible de télécharger la facture.',
    );
  },

  exportInvoicesExcel(params) {
    const qs = buildQueryString(params);
    const datePart = new Date().toISOString().slice(0, 10);
    return downloadBlob(
      `${API_URL}/api/admin/invoices/export/excel${qs}`,
      `factures-${datePart}.xlsx`,
      'Impossible d\'exporter les factures.',
    );
  },
};
