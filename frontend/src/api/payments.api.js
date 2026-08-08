import api from './axios';

export const paymentsApi = {
  initier: (orderId) =>
    api.post('/api/payments/cinetpay/initier', {
      orderId,
    }),

  verifier: (orderId) =>
    api.get(
      `/api/payments/cinetpay/verifier/${orderId}`
    ),
};