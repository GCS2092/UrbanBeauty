require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testMail() {
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP OK !');

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // s'envoie à toi-même
      subject: 'Test SMTP UrbanBeauty',
      text: 'Si tu vois ce mail, ton SMTP fonctionne !',
    });

    console.log('✅ Email envoyé avec succès !');
  } catch (error) {
    console.error('❌ Erreur SMTP :', error.message);
  }
}

testMail();