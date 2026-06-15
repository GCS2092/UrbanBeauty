const axios = require('axios');

async function sendEmail({ to, subject, html, attachments = [] }) {
  const payload = {
    sender: { email: process.env.FROM_EMAIL || 'sonshop221@gmail.com', name: 'UrbanBeauty' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (attachments.length > 0) {
    payload.attachment = attachments.map(({ filename, content }) => ({
      name: filename,
      content, // base64 string attendu par Brevo
    }));
  }

  await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}

module.exports = { sendEmail };