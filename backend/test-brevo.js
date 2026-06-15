require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'OK defini' : 'MANQUANT');

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    console.log('OK Connexion SMTP OK');
    await transporter.sendMail({
      from: 'sonshop221@gmail.com',
      to: 'sonshop221@gmail.com',
      subject: 'Test Brevo UrbanBeauty',
      html: '<h2>UrbanBeauty</h2><p>Brevo fonctionne !</p>',
    });
    console.log('OK Email envoye avec succes !');
  } catch (err) {
    console.error('ERREUR :', err.message);
  }
}

test();
