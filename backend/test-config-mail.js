require('dotenv').config();
const { createTransporter } = require('./src/config/email');

async function test() {
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log('? Connexion SMTP OK');
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Test UrbanBeauty - Commande',
      html: '<h2>?? UrbanBeauty</h2><p>Test email commande OK !</p>',
    });
    
    console.log('? Email envoyé avec succès !');
  } catch (err) {
    console.error('? ERREUR :', err.message);
  }
}

test();
