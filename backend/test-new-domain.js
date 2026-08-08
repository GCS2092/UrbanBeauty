require('dotenv').config();
const { sendEmail } = require('./src/config/email');

// Adresse à tester — modifie ici si besoin, sans toucher au .env
const TEST_FROM_EMAIL = 'noreply@sonshop.beauty';
const TEST_TO = process.env.SMTP_USER || 'sonshop221@gmail.com'; // destinataire du test

async function testNewDomain() {
  console.log('=== Test envoi via API Brevo (méthode prod) ===');
  console.log('FROM_EMAIL testé :', TEST_FROM_EMAIL);
  console.log('Destinataire      :', TEST_TO);
  console.log('BREVO_API_KEY     :', process.env.BREVO_API_KEY ? 'définie' : 'MANQUANTE');
  console.log('');

  // On force temporairement FROM_EMAIL pour ce test uniquement,
  // sans modifier le .env réel
  process.env.FROM_EMAIL = TEST_FROM_EMAIL;

  try {
    const result = await sendEmail({
      to: TEST_TO,
      subject: 'Test nouveau domaine — UrbanBeauty',
      html: `
        <h2>Test domaine sonshop.beauty</h2>
        <p>Si tu reçois cet email envoyé depuis <strong>${TEST_FROM_EMAIL}</strong>,
        l'authentification du domaine sur Brevo fonctionne correctement.</p>
      `,
    });
    console.log('✅ SUCCÈS — Email envoyé');
    console.log('Réponse Brevo:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ ÉCHEC —', err.message);
  }
}

testNewDomain();