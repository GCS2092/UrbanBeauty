const app = require('./src/app');
const cron = require('node-cron');
const {
  expireDraftReservations,
  notifyUpcomingExpirations,
} = require('./src/jobs/reservation-expiration.job');
const { collectReportData } = require('./src/modules/reports/report.service');
const { buildReportPdf } = require('./src/modules/reports/report-pdf.service');
const { sendEmail } = require('./src/config/email');
const { getSettings } = require('./src/modules/settings/settings.service');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Expiration des réservations brouillon WhatsApp — toutes les heures
cron.schedule('0 * * * *', async () => {
  try {
    const result = await expireDraftReservations();
    if (result.expired > 0) {
      console.log(`[cron] ${result.expired} brouillon(s) expiré(s) — stock libéré`);
    }
  } catch (err) {
    console.error('[cron] Erreur expiration réservations:', err.message);
  }
});

// Alerte admin avant expiration — toutes les 6 heures
cron.schedule('0 */6 * * *', async () => {
  try {
    await notifyUpcomingExpirations();
  } catch (err) {
    console.error('[cron] Erreur alertes expiration:', err.message);
  }
});

// Rapport mensuel automatique — tous les 1er du mois à 08h00
cron.schedule('0 8 1 * *', async () => {
  console.log('[cron] Génération rapport mensuel...');
  try {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString().split('T')[0];
    const to = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString().split('T')[0];

    const settings = await getSettings();
    const adminEmail = process.env.ADMIN_EMAIL || settings.company_email;
    const stores = await prisma.store.findMany({ where: { isActive: true } });

    for (const store of stores) {
      const data = await collectReportData(store.id, from, to);
      const pdfBuffer = await buildReportPdf(data);

      await sendEmail({
        to: adminEmail,
        subject: `📊 Rapport mensuel ${store.name} — ${from} au ${to}`,
        html: `
          <h2>Rapport mensuel automatique</h2>
          <p>Boutique : <strong>${store.name}</strong><br/>
          Période : <strong>${from} → ${to}</strong></p>
          <p>— Urban Beauty</p>
        `,
        attachments: [{
          filename: `rapport-${store.code}-${from}-${to}.pdf`,
          content: pdfBuffer.toString('base64'),
        }],
      });

      console.log(`[cron] ✅ Rapport envoyé pour ${store.name}`);
    }
  } catch (err) {
    console.error('[cron] ❌ Erreur rapport mensuel:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});