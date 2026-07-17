const axios = require('axios');

const BASE_URL = 'https://api.cinetpay.net';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { data } = await axios.post(`${BASE_URL}/v1/oauth/login`, {
    api_key: process.env.CINETPAY_API_KEY,
    api_password: process.env.CINETPAY_API_PASSWORD,
  });

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function initierPaiement({ merchantTransactionId, amount, designation, customer, notifyUrl, successUrl, failedUrl }) {
  const token = await getAccessToken();

  const { data } = await axios.post(
    `${BASE_URL}/v1/payment`,
    {
      currency: 'XOF',
      merchant_transaction_id: merchantTransactionId,
      amount,
      lang: 'fr',
      designation,
      client_email: customer.email,
      client_phone_number: customer.phone,
      client_first_name: customer.firstName,
      client_last_name: customer.lastName,
      success_url: successUrl,
      failed_url: failedUrl,
      notify_url: notifyUrl,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}

async function verifierStatut(merchantTransactionId) {
  const token = await getAccessToken();

  const { data } = await axios.get(`${BASE_URL}/v1/payment/${merchantTransactionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}

module.exports = { getAccessToken, initierPaiement, verifierStatut };